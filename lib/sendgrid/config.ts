import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.warn('SendGrid API key not found. Email functionality will not work.')
}

export default sgMail

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.SENDGRID_FROM_EMAIL || 'noreply@fertihub.ai',
  replyTo: process.env.SENDGRID_FROM_EMAIL || 'noreply@fertihub.ai',
}

// Email sending utility
export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const msg = {
      to,
      from: EMAIL_CONFIG.from,
      replyTo: EMAIL_CONFIG.replyTo,
      subject,
      html,
      text: text || stripHtml(html), // Fallback to stripped HTML if text not provided
    }

    const response = await sgMail.send(msg)
    return { success: true, response }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Utility to strip HTML tags for plain text version
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

