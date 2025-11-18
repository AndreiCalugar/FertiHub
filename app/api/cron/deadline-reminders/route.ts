import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, addDays, startOfDay } from 'date-fns'

/**
 * Cron job to check for approaching deadlines and send reminders
 * Runs daily to check inquiries with deadlines in the next 2 days
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel cron jobs send this header)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Calculate date range (next 2 days)
    const tomorrow = addDays(startOfDay(new Date()), 1)
    const twoDaysFromNow = addDays(tomorrow, 1)

    // Find inquiries with deadlines approaching
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        user_profile:user_profiles(*),
        product_category:product_categories(*),
        inquiry_suppliers:inquiry_suppliers(count),
        quotes:quotes(count, supplier_id)
      `)
      .not('deadline_date', 'is', null)
      .gte('deadline_date', tomorrow.toISOString())
      .lt('deadline_date', twoDaysFromNow.toISOString())
      .in('status', ['pending', 'in_progress'])

    if (error) {
      console.error('Error fetching inquiries:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const reminders = []

    for (const inquiry of inquiries || []) {
      // Check if reminder already sent
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', inquiry.user_id)
        .eq('inquiry_id', inquiry.id)
        .eq('type', 'deadline_reminder')
        .gte('created_at', startOfDay(new Date()).toISOString())
        .single()

      if (existingNotif) {
        continue // Already sent reminder today
      }

      // Count quotes received
      const quotes = (inquiry as any).quotes || []
      const uniqueSuppliers = new Set(quotes.map((q: any) => q.supplier_id))
      const quotesReceived = uniqueSuppliers.size
      const totalSuppliers = (inquiry as any).inquiry_suppliers?.[0]?.count || 0

      // Create notification
      await supabase.from('notifications').insert({
        user_id: inquiry.user_id,
        type: 'deadline_reminder',
        title: 'Deadline Approaching',
        message: `Your inquiry deadline for "${(inquiry as any).product_category?.name || 'product'}" is approaching (${format(new Date(inquiry.deadline_date!), 'MMM d')}). ${quotesReceived}/${totalSuppliers} quotes received.`,
        inquiry_id: inquiry.id,
        is_read: false,
      })

      // Send email notification
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: inquiry.user_id,
          type: 'inquiry_deadline',
          data: {
            productName: (inquiry as any).product_category?.name || inquiry.product_description,
            deadline: format(new Date(inquiry.deadline_date!), 'MMMM d, yyyy'),
            quotesReceived,
            totalSuppliers,
            inquiryId: inquiry.id,
          },
        }),
      })

      reminders.push({
        inquiryId: inquiry.id,
        userId: inquiry.user_id,
        deadline: inquiry.deadline_date,
      })
    }

    return NextResponse.json({
      success: true,
      remindersCount: reminders.length,
      reminders,
    })
  } catch (error: any) {
    console.error('Error in deadline reminders cron:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

