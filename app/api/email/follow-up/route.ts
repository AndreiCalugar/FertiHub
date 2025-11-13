import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/sendgrid/config'
import { getFollowUpEmailTemplate } from '@/lib/sendgrid/templates'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inquiryId, supplierIds } = body

    if (!inquiryId) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 })
    }

    // Fetch inquiry details
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select(`
        *,
        product_category:product_categories(*),
        user_profile:user_profiles(*)
      `)
      .eq('id', inquiryId)
      .eq('user_id', user.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Build query for inquiry suppliers
    let query = supabase
      .from('inquiry_suppliers')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('inquiry_id', inquiryId)
      .eq('response_received', false) // Only follow up with suppliers who haven't responded

    // If specific supplier IDs are provided, filter by them
    if (supplierIds && Array.isArray(supplierIds) && supplierIds.length > 0) {
      query = query.in('supplier_id', supplierIds)
    }

    const { data: inquirySuppliers, error: suppliersError } = await query

    if (suppliersError || !inquirySuppliers || inquirySuppliers.length === 0) {
      return NextResponse.json({ error: 'No suppliers to follow up with' }, { status: 404 })
    }

    const results = []
    const errors = []

    // Calculate days since inquiry
    const inquiryDate = new Date(inquiry.created_at)
    const now = new Date()
    const daysSinceInquiry = Math.floor((now.getTime() - inquiryDate.getTime()) / (1000 * 60 * 60 * 24))

    // Send follow-up email to each supplier
    for (const inquirySupplier of inquirySuppliers) {
      const supplier = inquirySupplier.supplier as any

      if (!supplier?.email) {
        errors.push({ supplierId: supplier.id, error: 'No email address' })
        continue
      }

      // Prepare email data
      const emailData = {
        supplierName: supplier.name,
        contactPerson: supplier.contact_person,
        organizationName: (inquiry.user_profile as any)?.organization_name || 'IVF Lab',
        productCategory: (inquiry.product_category as any)?.name || 'Product',
        productDescription: inquiry.product_description,
        inquiryId: inquiry.id,
        daysSinceInquiry: daysSinceInquiry > 0 ? daysSinceInquiry : 1,
      }

      // Generate email template
      const { subject, html } = getFollowUpEmailTemplate(emailData)

      // Send email
      const emailResult = await sendEmail({
        to: supplier.email,
        subject,
        html,
      })

      if (emailResult.success) {
        // Update last_followed_up_at
        await supabase
          .from('inquiry_suppliers')
          .update({
            last_followed_up_at: new Date().toISOString(),
          })
          .eq('id', inquirySupplier.id)

        // Create notification for user
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'follow_up_sent',
          title: 'Follow-up Sent',
          message: `Follow-up email sent to ${supplier.name}`,
          inquiry_id: inquiryId,
        })

        results.push({ supplierId: supplier.id, supplierName: supplier.name, status: 'sent' })
      } else {
        errors.push({ supplierId: supplier.id, supplierName: supplier.name, error: emailResult.error })
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error: any) {
    console.error('Error in follow-up API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

