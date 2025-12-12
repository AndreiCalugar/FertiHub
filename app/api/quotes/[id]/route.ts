import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/quotes/[id] - Fetch a single quote
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the quote and verify user has access (through inquiry ownership)
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        inquiry:inquiries!inner(
          id,
          user_id
        ),
        supplier:suppliers(*)
      `)
      .eq('id', id)
      .eq('inquiry.user_id', user.id)
      .single()

    if (error || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json({ quote })
  } catch (error: any) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/quotes/[id] - Update a quote
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      supplier_id,
      product_name,
      unit_price,
      total_price,
      currency,
      lead_time_days,
      validity_period,
      notes,
    } = body

    // Validate required fields
    if (!supplier_id || !product_name || !total_price || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First verify the quote exists and user has access
    const { data: existingQuote, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        id,
        inquiry:inquiries!inner(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .eq('inquiry.user_id', user.id)
      .single()

    if (fetchError || !existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the quote
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update({
        supplier_id,
        product_name,
        unit_price: unit_price ? parseFloat(unit_price) : null,
        total_price: parseFloat(total_price),
        currency,
        lead_time_days: lead_time_days ? parseInt(lead_time_days) : null,
        validity_period: validity_period || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      quote: updatedQuote,
      message: 'Quote updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/quotes/[id] - Delete a quote
 * (Moving existing delete logic here for consistency)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this quote
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        id,
        inquiry:inquiries!inner(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .eq('inquiry.user_id', user.id)
      .single()

    if (fetchError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete the quote
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

