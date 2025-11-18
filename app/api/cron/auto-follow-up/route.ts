import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/sendgrid/config'
import { getFollowUpEmailTemplate } from '@/lib/sendgrid/templates'

/**
 * Automated Follow-up Cron Job
 * 
 * This endpoint should be called periodically (e.g., daily) by a cron service like Vercel Cron
 * 
 * To set up with Vercel Cron:
 * 1. Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/auto-follow-up",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 * 
 * Or call manually: POST https://your-domain.com/api/cron/auto-follow-up
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get all active inquiries with pending responses
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select(`
        *,
        product_category:product_categories(*),
        user_profile:user_profiles!user_id(*),
        inquiry_suppliers!inner(
          *,
          supplier:suppliers(*)
        )
      `)
      .in('status', ['sent', 'partial'])

    if (inquiriesError) throw inquiriesError

    if (!inquiries || inquiries.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No inquiries require follow-up',
        followed_up: 0
      })
    }

    let followedUp = 0
    const results = []

    for (const inquiry of inquiries) {
      // Calculate days since inquiry
      const inquiryDate = new Date(inquiry.created_at)
      const now = new Date()
      const daysSinceInquiry = Math.floor((now.getTime() - inquiryDate.getTime()) / (1000 * 60 * 60 * 24))

      // Determine follow-up interval based on urgency
      let followUpInterval: number
      switch (inquiry.urgency_level) {
        case 5:
          followUpInterval = 1 // Follow up after 1 day
          break
        case 4:
          followUpInterval = 2
          break
        case 3:
          followUpInterval = 3
          break
        case 2:
          followUpInterval = 5
          break
        default:
          followUpInterval = 7
      }

      // Get suppliers who haven't responded
      const pendingSuppliers = (inquiry.inquiry_suppliers as any[]).filter((is: any) => {
        if (is.response_received) return false
        
        // Check if we should follow up
        const lastFollowUp = is.last_followed_up_at 
          ? new Date(is.last_followed_up_at) 
          : new Date(is.email_sent_at || is.created_at)
        
        const daysSinceLastContact = Math.floor((now.getTime() - lastFollowUp.getTime()) / (1000 * 60 * 60 * 24))
        
        return daysSinceLastContact >= followUpInterval
      })

      // Send follow-ups
      for (const inquirySupplier of pendingSuppliers) {
        const supplier = (inquirySupplier as any).supplier
        
        if (!supplier?.email) continue

        const emailData = {
          supplierName: supplier.name,
          contactPerson: supplier.contact_person,
          organizationName: (inquiry.user_profile as any)?.organization_name || 'IVF Lab',
          productCategory: (inquiry.product_category as any)?.name || 'Product',
          productDescription: inquiry.product_description,
          inquiryId: inquiry.id,
          daysSinceInquiry,
        }

        const { subject, html } = getFollowUpEmailTemplate(emailData)

        const emailResult = await sendEmail({
          to: supplier.email,
          subject,
          html,
        })

        if (emailResult.success) {
          // Update last_followed_up_at
          await supabase
            .from('inquiry_suppliers')
            .update({ last_followed_up_at: now.toISOString() })
            .eq('id', (inquirySupplier as any).id)

          // Create notification
          await supabase.from('notifications').insert({
            user_id: inquiry.user_id,
            type: 'follow_up_sent',
            title: 'Automatic Follow-up Sent',
            message: `Follow-up email sent to ${supplier.name} for your ${(inquiry.product_category as any)?.name || 'product'} inquiry`,
            inquiry_id: inquiry.id,
            is_read: false,
          })

          followedUp++
          results.push({
            inquiryId: inquiry.id,
            supplierId: supplier.id,
            supplierName: supplier.name,
            status: 'sent',
          })
        } else {
          results.push({
            inquiryId: inquiry.id,
            supplierId: supplier.id,
            supplierName: supplier.name,
            status: 'failed',
            error: emailResult.error,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${followedUp} follow-up emails`,
      followed_up: followedUp,
      details: results,
    })
  } catch (error: any) {
    console.error('Error in auto-follow-up:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
  return POST(request)
}

