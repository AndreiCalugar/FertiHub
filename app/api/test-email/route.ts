import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/sendgrid/config'

/**
 * Test endpoint to verify SendGrid integration
 * GET /api/test-email?to=your-email@example.com
 */
export async function GET(request: NextRequest) {
  try {
    // Get email from query params
    const searchParams = request.nextUrl.searchParams
    const toEmail = searchParams.get('to')

    if (!toEmail) {
      return NextResponse.json({
        error: 'Missing "to" parameter. Usage: /api/test-email?to=your-email@example.com'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(toEmail)) {
      return NextResponse.json({
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({
        error: 'SendGrid API key not configured',
        details: 'SENDGRID_API_KEY environment variable is missing'
      }, { status: 500 })
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      return NextResponse.json({
        error: 'SendGrid from email not configured',
        details: 'SENDGRID_FROM_EMAIL environment variable is missing'
      }, { status: 500 })
    }

    console.log('📧 Sending test email to:', toEmail)
    console.log('📤 From:', process.env.SENDGRID_FROM_EMAIL)

    // Send test email
    const result = await sendEmail({
      to: toEmail,
      subject: '✅ FertiHub SendGrid Test - SUCCESS!',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Success!</h1>
          </div>
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">SendGrid Integration is Working! ✅</h2>
            <p>Congratulations! Your FertiHub application is successfully configured to send emails via SendGrid.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #1e40af;">Configuration Details:</h3>
              <p style="margin: 5px 0;"><strong>From Email:</strong> ${process.env.SENDGRID_FROM_EMAIL}</p>
              <p style="margin: 5px 0;"><strong>API Status:</strong> Connected</p>
              <p style="margin: 5px 0;"><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <h3 style="color: #333;">What's Next?</h3>
            <ul style="line-height: 1.8;">
              <li>✅ Create inquiries and send emails to suppliers</li>
              <li>✅ Receive quote notifications via email</li>
              <li>✅ Get automated follow-up reminders</li>
              <li>✅ Receive deadline alerts</li>
            </ul>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
              This is a test email sent from your FertiHub application to verify SendGrid integration.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (result.success) {
      console.log('✅ Test email sent successfully!')
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        details: {
          to: toEmail,
          from: process.env.SENDGRID_FROM_EMAIL,
          timestamp: new Date().toISOString(),
          note: 'Check your inbox (and spam folder) for the test email'
        }
      })
    } else {
      console.error('❌ Failed to send test email:', result.error)
      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
        details: result.error
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ Test email error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

