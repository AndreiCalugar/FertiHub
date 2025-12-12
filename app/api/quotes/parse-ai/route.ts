import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseQuoteFromText } from '@/lib/ai/quote-parser'

/**
 * POST /api/quotes/parse-ai
 * Parse quote data from text using AI
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, inquiryId } = body

    if (!text || !inquiryId) {
      return NextResponse.json(
        { error: 'Missing required fields (text, inquiryId)' },
        { status: 400 }
      )
    }

    // Verify user has access to this inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('id, user_id')
      .eq('id', inquiryId)
      .eq('user_id', user.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found or unauthorized' },
        { status: 404 }
      )
    }

    console.log('🤖 Parsing quote with AI for inquiry:', inquiryId)

    // Parse the quote using AI
    const parsedQuote = await parseQuoteFromText(text)

    console.log('✅ AI parsing complete:', {
      confidence: parsedQuote.confidence_score,
      needsReview: parsedQuote.needs_review,
      hasPrice: !!parsedQuote.total_price,
    })

    return NextResponse.json({
      success: true,
      parsedQuote,
      message: parsedQuote.needs_review
        ? 'Quote parsed with low confidence - please review'
        : 'Quote parsed successfully',
    })
  } catch (error: any) {
    console.error('❌ Error parsing quote:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to parse quote' },
      { status: 500 }
    )
  }
}

