import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/profile-setup')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to FertiHub
            </h1>
            <p className="text-gray-600 mt-1">
              {profile.organization_name}
            </p>
          </div>
          <form action={handleSignOut}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>

        {/* Dashboard Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Inquiries</CardTitle>
              <CardDescription>Quote requests in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-gray-500 mt-2">No active inquiries yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quotes Received</CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-gray-500 mt-2">No quotes received yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>In your network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-gray-500 mt-2">Add suppliers to get started</p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🎉 Your account is set up!</CardTitle>
            <CardDescription>Phase 2 Complete - Authentication & User Management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You've successfully created your FertiHub account and set up your organization profile.
            </p>
            
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li>✅ Phase 1: Foundation Setup - Complete</li>
                <li>✅ Phase 2: Authentication & User Management - Complete</li>
                <li>🚧 Phase 3: Core Features (Coming Soon)</li>
                <li className="ml-6">- Supplier Management</li>
                <li className="ml-6">- Inquiry Creation</li>
                <li className="ml-6">- Quote Comparison</li>
              </ul>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500">
                <strong>Your Profile:</strong>
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Email: {user.email}</li>
                <li>• Organization: {profile.organization_name}</li>
                <li>• Type: {profile.organization_type}</li>
                {profile.location && <li>• Location: {profile.location}</li>}
                <li>• Role: {profile.role}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

