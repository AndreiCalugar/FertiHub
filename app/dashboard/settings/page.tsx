import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProfileForm } from '@/components/settings/profile-form'
import { PasswordChange } from '@/components/settings/password-change'
import { NotificationPreferences } from '@/components/settings/notification-preferences'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const notificationPreferences = profile?.notification_preferences || {
    email_notifications: true,
    quote_received_email: true,
    inquiry_updates_email: true,
    system_notifications: true,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Email</p>
              <p className="font-medium text-sm sm:text-base truncate">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Account Created</p>
              <p className="font-medium text-sm sm:text-base">
                {new Date(user!.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details - Now Editable */}
      <ProfileForm profile={{
        organization_name: profile!.organization_name,
        organization_type: profile!.organization_type as 'lab' | 'clinic' | 'hospital',
        location: profile!.location,
        role: profile!.role as 'admin' | 'lab_manager' | 'technician',
      }} />

      {/* Password Change */}
      <PasswordChange />

      {/* Notification Preferences */}
      <NotificationPreferences preferences={notificationPreferences} />

      {/* Environment Variables Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Integration Status</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Check if your services are configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">Supabase</p>
              <p className="text-xs sm:text-sm text-gray-600">Database & Authentication</p>
            </div>
            <Badge variant="default" className="bg-green-600 flex-shrink-0 text-xs">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">SendGrid</p>
              <p className="text-xs sm:text-sm text-gray-600">Email Automation</p>
            </div>
            <Badge variant="default" className="bg-green-600 flex-shrink-0 text-xs">Configured</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Future Features Placeholder */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs sm:text-sm text-gray-600">
          <p>• Edit profile information</p>
          <p>• Change password</p>
          <p>• Email notification preferences</p>
          <p>• Team member management</p>
          <p>• API key management</p>
        </CardContent>
      </Card>
    </div>
  )
}

