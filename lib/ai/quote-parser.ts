/**
 * AI Quote Parser using OpenAI API
 * Extracts structured quote data from email text or documents
 */

interface ParsedQuote {
  product_name: string | null
  unit_price: number | null
  total_price: number | null
  currency: string | null
  lead_time_days: number | null
  validity_period: string | null
  notes: string | null
  confidence_score: number
  needs_review: boolean
}

export async function parseQuoteFromText(text: string): Promise<ParsedQuote> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting structured quote/quotation data from emails and documents. 
Extract the following information:
- product_name: The name or model of the product being quoted
- unit_price: Price per unit (number only, no currency symbols)
- total_price: Total price (number only, no currency symbols)
- currency: Currency code (USD, EUR, GBP, etc.)
- lead_time_days: Delivery/lead time in days (extract number only)
- validity_period: How long the quote is valid (text format, e.g. "30 days")
- notes: Any additional important information

Return ONLY a JSON object with these exact fields. If a field cannot be determined, use null.
Also include a "confidence" field (0.0 to 1.0) indicating how confident you are in the extraction.`,
          },
          {
            role: 'user',
            content: `Extract quote data from this text:\n\n${text}`,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)

    // Validate and structure the response
    const confidence = parsed.confidence || 0.5
    const needsReview = confidence < 0.7 || !parsed.total_price

    return {
      product_name: parsed.product_name || null,
      unit_price: parsed.unit_price ? parseFloat(parsed.unit_price) : null,
      total_price: parsed.total_price ? parseFloat(parsed.total_price) : null,
      currency: parsed.currency?.toUpperCase() || 'USD',
      lead_time_days: parsed.lead_time_days ? parseInt(parsed.lead_time_days) : null,
      validity_period: parsed.validity_period || null,
      notes: parsed.notes || null,
      confidence_score: confidence,
      needs_review: needsReview,
    }
  } catch (error: any) {
    console.error('Error parsing quote:', error)
    throw new Error(`Failed to parse quote: ${error.message}`)
  }
}

/**
 * Extract text from PDF (basic implementation)
 * For production, consider using pdf-parse or similar library
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // For MVP, we'll return a simple message
  // In production, implement proper PDF parsing
  return `[PDF Content from ${file.name}]\nNote: PDF parsing not yet implemented. Please paste text manually.`
}

