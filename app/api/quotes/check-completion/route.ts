import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if all suppliers have responded to an inquiry
 * Called after a quote is added to trigger "all quotes received" notification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inquiryId } = body

    if (!inquiryId) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 })
    }

    // Get inquiry details
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('*, product_category:product_categories(*)')
      .eq('id', inquiryId)
      .eq('user_id', user.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Count total suppliers contacted
    const { count: totalSuppliers } = await supabase
      .from('inquiry_suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('inquiry_id', inquiryId)

    // Count suppliers who have submitted quotes
    const { data: quotes } = await supabase
      .from('quotes')
      .select('supplier_id')
      .eq('inquiry_id', inquiryId)

    const uniqueSuppliers = new Set(quotes?.map(q => q.supplier_id) || [])
    const quotesReceived = uniqueSuppliers.size

    // If all suppliers have responded
    if (totalSuppliers && quotesReceived === totalSuppliers) {
      // Check if notification already sent
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('inquiry_id', inquiryId)
        .eq('type', 'all_quotes_received')
        .single()

      if (!existingNotif) {
        // Create "all quotes received" notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'all_quotes_received',
          title: 'All Quotes Received!',
          message: `All ${totalSuppliers} suppliers have responded to your ${(inquiry.product_category as any)?.name || 'product'} inquiry. Compare quotes now!`,
          inquiry_id: inquiryId,
          is_read: false,
        })

        return NextResponse.json({
          success: true,
          allQuotesReceived: true,
          totalSuppliers,
          quotesReceived,
        })
      }
    }

    return NextResponse.json({
      success: true,
      allQuotesReceived: false,
      totalSuppliers,
      quotesReceived,
    })
  } catch (error: any) {
    console.error('Error checking completion:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

