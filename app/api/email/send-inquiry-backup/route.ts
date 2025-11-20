import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/sendgrid/config'
import { getInquiryEmailTemplate } from '@/lib/sendgrid/templates'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inquiryId } = body

    if (!inquiryId) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 })
    }

    // Fetch inquiry details with related data
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

    // Fetch inquiry suppliers
    const { data: inquirySuppliers, error: suppliersError } = await supabase
      .from('inquiry_suppliers')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('inquiry_id', inquiryId)

    if (suppliersError || !inquirySuppliers || inquirySuppliers.length === 0) {
      return NextResponse.json({ error: 'No suppliers found for this inquiry' }, { status: 404 })
    }

    const results = []
    const errors = []

    // Send email to each supplier
    for (const inquirySupplier of inquirySuppliers) {
      const supplier = inquirySupplier.supplier as any

      if (!supplier?.email) {
        errors.push({ supplierId: supplier?.id, error: 'No email address' })
        continue
      }

      // Prepare email data
      const emailData = {
        supplierName: supplier.name,
        contactPerson: supplier.contact_person,
        organizationName: (inquiry.user_profile as any)?.organization_name || 'IVF Lab',
        productCategory: (inquiry.product_category as any)?.name || 'Product',
        productDescription: inquiry.product_description,
        quantity: inquiry.quantity,
        urgencyLevel: inquiry.urgency_level,
        notes: inquiry.notes,
        inquiryId: inquiry.id,
        replyEmail: user.email || 'noreply@fertihub.ai',
        attachmentUrl: inquiry.attachment_url,
      }

      // Generate email template
      const { subject, html } = getInquiryEmailTemplate(emailData)

      // Send email
      const emailResult = await sendEmail({
        to: supplier.email,
        subject,
        html,
      })

      if (emailResult.success) {
        // Update inquiry_supplier record
        await supabase
          .from('inquiry_suppliers')
          .update({
            email_sent_at: new Date().toISOString(),
            email_status: 'sent',
          })
          .eq('id', inquirySupplier.id)

        results.push({ supplierId: supplier.id, supplierName: supplier.name, status: 'sent' })
      } else {
        // Update as failed
        await supabase
          .from('inquiry_suppliers')
          .update({
            email_status: 'failed',
          })
          .eq('id', inquirySupplier.id)

        errors.push({ supplierId: supplier.id, supplierName: supplier.name, error: emailResult.error })
      }
    }

    // Update inquiry status to 'sent' if at least one email was sent successfully
    if (results.length > 0) {
      await supabase
        .from('inquiries')
        .update({ status: 'sent' })
        .eq('id', inquiryId)
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error: any) {
    console.error('Error in send-inquiry API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

