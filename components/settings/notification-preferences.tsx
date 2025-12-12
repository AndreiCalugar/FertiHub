'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'

interface NotificationPreferencesProps {
  preferences: {
    email_notifications: boolean
    quote_received_email: boolean
    inquiry_updates_email: boolean
    system_notifications: boolean
  }
}

export function NotificationPreferences({ preferences }: NotificationPreferencesProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [settings, setSettings] = useState({
    email_notifications: preferences.email_notifications ?? true,
    quote_received_email: preferences.quote_received_email ?? true,
    inquiry_updates_email: preferences.inquiry_updates_email ?? true,
    system_notifications: preferences.system_notifications ?? true,
  })

  const handleSave = async () => {
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          notification_preferences: settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast.success('Notification preferences updated')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences')
      toast.error('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(preferences)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <div>
            <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose how you want to be notified
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Email Notifications Master Toggle */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive email notifications
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={settings.email_notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_notifications: checked })
              }
              disabled={loading}
            />
          </div>

          {/* Quote Received */}
          <div className="flex items-center justify-between pl-4">
            <div className="space-y-0.5">
              <Label 
                htmlFor="quote_received_email" 
                className={settings.email_notifications ? '' : 'text-gray-400'}
              >
                Quote Received
              </Label>
              <p className="text-sm text-gray-500">
                When a supplier sends a quote
              </p>
            </div>
            <Switch
              id="quote_received_email"
              checked={settings.quote_received_email}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, quote_received_email: checked })
              }
              disabled={loading || !settings.email_notifications}
            />
          </div>

          {/* Inquiry Updates */}
          <div className="flex items-center justify-between pl-4">
            <div className="space-y-0.5">
              <Label 
                htmlFor="inquiry_updates_email"
                className={settings.email_notifications ? '' : 'text-gray-400'}
              >
                Inquiry Updates
              </Label>
              <p className="text-sm text-gray-500">
                Status changes and supplier responses
              </p>
            </div>
            <Switch
              id="inquiry_updates_email"
              checked={settings.inquiry_updates_email}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, inquiry_updates_email: checked })
              }
              disabled={loading || !settings.email_notifications}
            />
          </div>

          {/* System Notifications */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="system_notifications" className="text-base font-medium">
                In-App Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Show notifications in the app
              </p>
            </div>
            <Switch
              id="system_notifications"
              checked={settings.system_notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, system_notifications: checked })
              }
              disabled={loading}
            />
          </div>
        </div>

        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

