// Email templates for FertiHub

export interface InquiryEmailData {
  supplierName: string
  contactPerson?: string
  organizationName: string
  productCategory: string
  productDescription: string
  quantity: number
  urgencyLevel: number
  notes?: string
  inquiryId: string
  replyEmail: string
  attachmentUrl?: string
}

export interface FollowUpEmailData {
  supplierName: string
  contactPerson?: string
  organizationName: string
  productCategory: string
  productDescription: string
  inquiryId: string
  daysSinceInquiry: number
}

export interface QuoteReceivedEmailData {
  userName: string
  supplierName: string
  productName: string
  totalPrice: number
  currency: string
  inquiryId: string
  dashboardUrl: string
}

export interface AllQuotesReceivedEmailData {
  userName: string
  productDescription: string
  totalQuotes: number
  inquiryId: string
  dashboardUrl: string
}

// Template: Initial inquiry to supplier
export function getInquiryEmailTemplate(data: InquiryEmailData): { subject: string; html: string } {
  const urgencyText = data.urgencyLevel >= 4 ? '🔴 URGENT' : data.urgencyLevel === 3 ? '🟡 Normal Priority' : '🟢 Low Priority'
  
  return {
    subject: `RFQ: ${data.productCategory} - ${data.organizationName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Request for Quotation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Request for Quotation</h1>
    <p style="color: #f0f0f0; margin: 10px 0 0 0;">Ref: ${data.inquiryId.substring(0, 8)}</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="margin-top: 0;">Dear ${data.contactPerson || data.supplierName},</p>
    
    <p>We are writing to request a quotation for the following product(s):</p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">Organization:</td>
          <td style="padding: 8px 0;">${data.organizationName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Product Category:</td>
          <td style="padding: 8px 0;">${data.productCategory}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Description:</td>
          <td style="padding: 8px 0;">${data.productDescription}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Quantity:</td>
          <td style="padding: 8px 0;">${data.quantity}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Priority:</td>
          <td style="padding: 8px 0;">${urgencyText}</td>
        </tr>
        ${data.notes ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Additional Notes:</td>
          <td style="padding: 8px 0;">${data.notes}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    ${data.attachmentUrl ? `
    <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #0c4a6e;">📎 Attachment Included</p>
      <p style="margin: 0;">
        <a href="${data.attachmentUrl}" 
           style="color: #0284c7; text-decoration: underline;"
           target="_blank">
          Download Specification Document
        </a>
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">
        Click the link above to view the detailed specifications and requirements.
      </p>
    </div>
    ` : ''}
    
    <p><strong>Please provide the following information in your quotation:</strong></p>
    <ul style="line-height: 1.8;">
      <li>Product name and model number</li>
      <li>Unit price and total price</li>
      <li>Currency</li>
      <li>Lead time / delivery time</li>
      <li>Quotation validity period</li>
      <li>Any additional relevant information</li>
    </ul>
    
    <p>Please reply directly to this email with your quotation at your earliest convenience.</p>
    
    <p style="margin-bottom: 0;">Best regards,<br>
    <strong>${data.organizationName}</strong><br>
    <a href="mailto:${data.replyEmail}" style="color: #667eea;">${data.replyEmail}</a></p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
    <p style="margin: 0;">This inquiry was sent via <strong>FertiHub</strong> - IVF Procurement Platform</p>
    <p style="margin: 10px 0 0 0;">Reference ID: ${data.inquiryId}</p>
  </div>
</body>
</html>
    `,
  }
}

// Template: Follow-up reminder to supplier
export function getFollowUpEmailTemplate(data: FollowUpEmailData): { subject: string; html: string } {
  return {
    subject: `Follow-up: RFQ - ${data.productCategory} (Ref: ${data.inquiryId.substring(0, 8)})`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow-up: Request for Quotation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Follow-up: Quotation Request</h1>
    <p style="color: #f0f0f0; margin: 10px 0 0 0;">Ref: ${data.inquiryId.substring(0, 8)}</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="margin-top: 0;">Dear ${data.contactPerson || data.supplierName},</p>
    
    <p>This is a friendly follow-up regarding our quotation request sent <strong>${data.daysSinceInquiry} day(s) ago</strong>.</p>
    
    <div style="background: #fff4e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c;">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Original Request:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">Organization:</td>
          <td style="padding: 8px 0;">${data.organizationName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Product Category:</td>
          <td style="padding: 8px 0;">${data.productCategory}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Description:</td>
          <td style="padding: 8px 0;">${data.productDescription}</td>
        </tr>
      </table>
    </div>
    
    <p>We would appreciate it if you could provide your quotation at your earliest convenience.</p>
    
    <p>If you have already sent your quotation and we missed it, please accept our apologies. Feel free to resend it or confirm receipt.</p>
    
    <p>If you are unable to provide a quotation for this request, please let us know so we can plan accordingly.</p>
    
    <p style="margin-bottom: 0;">Thank you for your attention.<br><br>
    Best regards,<br>
    <strong>${data.organizationName}</strong></p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
    <p style="margin: 0;">This follow-up was sent via <strong>FertiHub</strong> - IVF Procurement Platform</p>
    <p style="margin: 10px 0 0 0;">Reference ID: ${data.inquiryId}</p>
  </div>
</body>
</html>
    `,
  }
}

// Template: Notification to user when a quote is received
export function getQuoteReceivedEmailTemplate(data: QuoteReceivedEmailData): { subject: string; html: string } {
  return {
    subject: `New Quote Received from ${data.supplierName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Quote Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✓ New Quote Received!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="margin-top: 0;">Hi ${data.userName},</p>
    
    <p>Great news! You've received a new quotation for your inquiry.</p>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #43e97b;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">Supplier:</td>
          <td style="padding: 8px 0;">${data.supplierName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Product:</td>
          <td style="padding: 8px 0;">${data.productName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Total Price:</td>
          <td style="padding: 8px 0; font-size: 18px; color: #059669;"><strong>${data.currency} ${data.totalPrice.toLocaleString()}</strong></td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}/dashboard/inquiries/${data.inquiryId}" 
         style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View Quote Details
      </a>
    </div>
    
    <p style="margin-bottom: 0;">Log in to your FertiHub dashboard to compare this quote with others and make an informed decision.</p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
    <p style="margin: 0;">Powered by <strong>FertiHub</strong> - IVF Procurement Platform</p>
  </div>
</body>
</html>
    `,
  }
}

// Template: Notification when all suppliers have responded
export function getAllQuotesReceivedEmailTemplate(data: AllQuotesReceivedEmailData): { subject: string; html: string } {
  return {
    subject: `All Quotes Received! - ${data.productDescription}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Quotes Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 All Quotes Received!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="margin-top: 0;">Hi ${data.userName},</p>
    
    <p>Excellent news! All suppliers have responded to your inquiry.</p>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 16px;"><strong>Product:</strong> ${data.productDescription}</p>
      <p style="margin: 10px 0 0 0; font-size: 24px; color: #d97706;"><strong>${data.totalQuotes} Quotes</strong> received</p>
    </div>
    
    <p>Now you can compare all the quotes side-by-side and make the best decision for your lab.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}/dashboard/inquiries/${data.inquiryId}" 
         style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Compare Quotes Now
      </a>
    </div>
    
    <p style="margin-bottom: 0;">The comparison table will highlight the best prices and lead times to help you decide quickly.</p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
    <p style="margin: 0;">Powered by <strong>FertiHub</strong> - IVF Procurement Platform</p>
  </div>
</body>
</html>
    `,
  }
}

