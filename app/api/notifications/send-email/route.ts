import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/sendgrid/config'

/**
 * Send email notification to user
 * Called when important events occur
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { userId, type, data } = body

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user details
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    if (!user?.user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userEmail = user.user.email

    // Get user profile for organization name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_name')
      .eq('id', userId)
      .single()

    const organizationName = profile?.organization_name || 'User'

    let emailHtml = ''
    let subject = ''

    switch (type) {
      case 'quote_received':
        subject = `New Quote Received - ${data.supplierName}`
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">✓ New Quote Received!</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <p>Hi ${organizationName},</p>
              <p>Great news! You've received a new quotation:</p>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Supplier:</strong> ${data.supplierName}</p>
                <p><strong>Product:</strong> ${data.productName}</p>
                <p><strong>Price:</strong> ${data.currency} ${data.totalPrice}</p>
              </div>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inquiries/${data.inquiryId}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Quote
                </a>
              </p>
            </div>
          </body>
          </html>
        `
        break

      case 'all_quotes_received':
        subject = `All Quotes Received - ${data.productName}`
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🎉 All Quotes Received!</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <p>Hi ${organizationName},</p>
              <p>Excellent news! All suppliers have responded to your inquiry.</p>
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-size: 16px;"><strong>Product:</strong> ${data.productName}</p>
                <p style="margin: 10px 0 0 0; font-size: 24px; color: #d97706;"><strong>${data.totalQuotes} Quotes</strong> received</p>
              </div>
              <p>Now you can compare all the quotes side-by-side and make the best decision for your lab.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inquiries/${data.inquiryId}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Compare Quotes Now
                </a>
              </p>
            </div>
          </body>
          </html>
        `
        break

      case 'inquiry_deadline':
        subject = `Inquiry Deadline Reminder - ${data.productName}`
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">⏰ Deadline Reminder</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <p>Hi ${organizationName},</p>
              <p>This is a reminder that your inquiry deadline is approaching:</p>
              <div style="background: #fff4e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Product:</strong> ${data.productName}</p>
                <p><strong>Deadline:</strong> ${data.deadline}</p>
                <p><strong>Quotes Received:</strong> ${data.quotesReceived} of ${data.totalSuppliers}</p>
              </div>
              <p>You may want to follow up with suppliers who haven't responded yet.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inquiries/${data.inquiryId}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Inquiry
                </a>
              </p>
            </div>
          </body>
          </html>
        `
        break

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject,
      html: emailHtml,
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending email notification:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

