# SendGrid Email Configuration

This directory contains email configuration and templates for FertiHub.

## Setup

### 1. Create a SendGrid Account

1. Go to [https://sendgrid.com/](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free forever)
3. Verify your email address

### 2. Create an API Key

1. Log in to SendGrid dashboard
2. Go to **Settings > API Keys**
3. Click "Create API Key"
4. Choose "Restricted Access" and enable **Mail Send** permission
5. Copy the API key (you won't see it again!)

### 3. Verify Sender Identity

**For development (easy setup):**
1. Go to **Settings > Sender Authentication > Single Sender Verification**
2. Click "Create New Sender"
3. Fill in your details (use your real email)
4. Verify via email link

**For production (professional setup):**
1. Go to **Settings > Sender Authentication > Domain Authentication**
2. Follow the wizard to verify your domain (fertihub.ai)
3. Add DNS records as instructed

### 4. Configure Environment Variables

Add to your `.env.local`:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-email@example.com
```

For production, use your verified domain email:
```bash
SENDGRID_FROM_EMAIL=noreply@fertihub.ai
```

## Email Templates

### Available Templates

1. **Inquiry Email** (`getInquiryEmailTemplate`)
   - Sent to suppliers when a new inquiry is created
   - Includes: product details, organization info, urgency level

2. **Follow-up Email** (`getFollowUpEmailTemplate`)
   - Sent to suppliers who haven't responded
   - Includes: original request reference, days since inquiry

3. **Quote Received Notification** (`getQuoteReceivedEmailTemplate`)
   - Sent to users when a supplier submits a quote
   - Includes: supplier name, price, product details

4. **All Quotes Received** (`getAllQuotesReceivedEmailTemplate`)
   - Sent when all suppliers have responded
   - Prompts user to compare quotes

## API Endpoints

### Send Inquiry Emails

```typescript
POST /api/email/send-inquiry

Body:
{
  "inquiryId": "uuid-of-inquiry"
}

Response:
{
  "success": true,
  "sent": 3,
  "failed": 0,
  "results": [...]
}
```

### Send Follow-up Emails

```typescript
POST /api/email/follow-up

Body:
{
  "inquiryId": "uuid-of-inquiry",
  "supplierIds": ["uuid1", "uuid2"] // Optional, if not provided, follows up with all non-responders
}

Response:
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "results": [...]
}
```

## Usage in Application

### Sending Inquiry Emails

```typescript
// After creating an inquiry
const response = await fetch('/api/email/send-inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ inquiryId: inquiry.id }),
})

const result = await response.json()
console.log(`Sent ${result.sent} emails`)
```

### Sending Follow-ups

```typescript
// Manual follow-up button
const response = await fetch('/api/email/follow-up', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ inquiryId: inquiry.id }),
})
```

## Testing

### Test Email Sending (Development)

Create a test file `test-email.ts`:

```typescript
import { sendEmail } from '@/lib/sendgrid/config'
import { getInquiryEmailTemplate } from '@/lib/sendgrid/templates'

const testData = {
  supplierName: 'Test Supplier',
  organizationName: 'Test Lab',
  productCategory: 'Incubator',
  productDescription: 'Test product',
  quantity: 1,
  urgencyLevel: 3,
  inquiryId: 'test-123',
  replyEmail: 'test@example.com',
}

const { subject, html } = getInquiryEmailTemplate(testData)

await sendEmail({
  to: 'your-test-email@example.com',
  subject,
  html,
})
```

## Deliverability Tips

1. **Warm up your sending**: Start with small volumes and gradually increase
2. **Monitor your reputation**: Check SendGrid's analytics dashboard
3. **Include unsubscribe links**: For production (required by law in many countries)
4. **Use a professional from address**: noreply@fertihub.ai looks better than gmail
5. **Avoid spam triggers**: Don't use ALL CAPS, excessive exclamation marks!!!

## Troubleshooting

**Emails not sending?**
- Check API key is correct in `.env.local`
- Verify sender email is authenticated in SendGrid
- Check SendGrid activity feed for errors
- Look at server logs for error messages

**Emails going to spam?**
- Set up domain authentication (SPF, DKIM, DMARC)
- Use a professional from address
- Include plain text version (done automatically)
- Add unsubscribe link

**Rate limiting?**
- Free plan: 100 emails/day
- Upgrade to paid plan if needed
- Implement queue system for large batches

## Next Steps

For Phase 2 (Future):
- Implement automated follow-up cron job
- Add email tracking (open rates, click rates)
- Implement email response parsing with AI
- Add email templates customization in settings

