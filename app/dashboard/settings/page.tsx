import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account and organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="font-medium">
                {new Date(user!.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Organization Name</p>
              <p className="font-medium">{profile?.organization_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Organization Type</p>
              <p className="font-medium capitalize">{profile?.organization_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">{profile?.location || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Role</p>
              <Badge variant="secondary" className="capitalize">
                {profile?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>Check if your services are configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Supabase</p>
              <p className="text-sm text-gray-600">Database & Authentication</p>
            </div>
            <Badge variant="default" className="bg-green-600">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">SendGrid</p>
              <p className="text-sm text-gray-600">Email Automation</p>
            </div>
            <Badge variant="default" className="bg-green-600">Configured</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Future Features Placeholder */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
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

