import { createClient } from '@/lib/supabase/server'
import { NotificationType } from '@/lib/types/database.types'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  inquiryId?: string
}

export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    inquiry_id: params.inquiryId || null,
    is_read: false,
  })

  if (error) {
    console.error('Error creating notification:', error)
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return count || 0
}

