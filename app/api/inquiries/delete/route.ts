import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Delete an inquiry and all related data
 * This will cascade delete: inquiry_suppliers, quotes, and notifications
 */
export async function DELETE(request: NextRequest) {
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

    console.log('🗑️ Deleting inquiry:', inquiryId)

    // Verify the inquiry belongs to the user
    const { data: inquiry, error: checkError } = await supabase
      .from('inquiries')
      .select('id, user_id')
      .eq('id', inquiryId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !inquiry) {
      console.error('❌ Inquiry not found or unauthorized:', checkError)
      return NextResponse.json({ error: 'Inquiry not found or unauthorized' }, { status: 404 })
    }

    // Delete related data first (if cascade delete is not set up)
    // Note: If you have ON DELETE CASCADE in your database, these are optional
    
    // Delete notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('inquiry_id', inquiryId)

    // Delete quotes
    await supabase
      .from('quotes')
      .delete()
      .eq('inquiry_id', inquiryId)

    // Delete inquiry_suppliers
    await supabase
      .from('inquiry_suppliers')
      .delete()
      .eq('inquiry_id', inquiryId)

    // Delete the inquiry itself
    const { error: deleteError } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', inquiryId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ Failed to delete inquiry:', deleteError)
      return NextResponse.json({ error: 'Failed to delete inquiry', details: deleteError }, { status: 500 })
    }

    console.log('✅ Inquiry deleted successfully')

    return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' })
  } catch (error: any) {
    console.error('❌ Error deleting inquiry:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

