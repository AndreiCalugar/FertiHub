import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/quotes - Create a new quote
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      inquiry_id,
      supplier_id,
      product_name,
      unit_price,
      total_price,
      currency,
      lead_time_days,
      validity_period,
      notes,
      ai_extracted,
      confidence_score,
    } = body

    // Validate required fields
    if (!inquiry_id || !supplier_id || !product_name || !total_price || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user has access to this inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('id, user_id')
      .eq('id', inquiry_id)
      .eq('user_id', user.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found or unauthorized' },
        { status: 404 }
      )
    }

    // Create the quote
    const { data: quote, error: insertError } = await supabase
      .from('quotes')
      .insert({
        inquiry_id,
        supplier_id,
        product_name,
        unit_price: unit_price ? parseFloat(unit_price) : null,
        total_price: parseFloat(total_price),
        currency,
        lead_time_days: lead_time_days ? parseInt(lead_time_days) : null,
        validity_period: validity_period || null,
        notes: notes || null,
        ai_extracted: ai_extracted || false,
        confidence_score: confidence_score || null,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Create notification
    const supplierData = await supabase
      .from('suppliers')
      .select('name')
      .eq('id', supplier_id)
      .single()

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'quote_received',
      title: 'New Quote Received',
      message: `Quote received from ${supplierData.data?.name || 'supplier'} for ${product_name}`,
      inquiry_id,
    })

    return NextResponse.json({
      success: true,
      quote,
      message: 'Quote created successfully',
    })
  } catch (error: any) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

