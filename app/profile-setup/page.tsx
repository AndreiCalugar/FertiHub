'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'lab' as 'lab' | 'clinic' | 'hospital',
    location: '',
    role: 'lab_manager' as 'admin' | 'lab_manager' | 'technician',
  })

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        // Profile already exists, redirect to dashboard
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!userId) {
      setError('User not authenticated')
      setSubmitting(false)
      return
    }

    try {
      const supabase = createClient()

      // Create user profile
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: userId,
        organization_name: formData.organizationName,
        organization_type: formData.organizationType,
        location: formData.location,
        role: formData.role,
      })

      if (profileError) {
        throw profileError
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your profile')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Complete Your Profile</CardTitle>
          <CardDescription className="text-sm">
            Tell us about your organization to get started with FertiHub
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 sm:space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-sm">Organization Name *</Label>
              <Input
                id="organizationName"
                placeholder="e.g., City Fertility Clinic"
                value={formData.organizationName}
                onChange={(e) =>
                  setFormData({ ...formData, organizationName: e.target.value })
                }
                required
                disabled={submitting}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType" className="text-sm">Organization Type *</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value: 'lab' | 'clinic' | 'hospital') =>
                  setFormData({ ...formData, organizationType: value })
                }
                disabled={submitting}
              >
                <SelectTrigger id="organizationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">IVF Laboratory</SelectItem>
                  <SelectItem value="clinic">Fertility Clinic</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm">Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, USA"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={submitting}
                className="text-base"
              />
              <p className="text-xs text-gray-500">City, Country</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm">Your Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'lab_manager' | 'technician') =>
                  setFormData({ ...formData, role: value })
                }
                disabled={submitting}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="lab_manager">Lab Manager</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={submitting} size="lg">
              {submitting ? 'Creating profile...' : 'Complete Setup'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}

