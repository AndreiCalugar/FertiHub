'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface ProfileFormProps {
  profile: {
    organization_name: string
    organization_type: 'lab' | 'clinic' | 'hospital'
    location: string | null
    role: 'admin' | 'lab_manager' | 'technician'
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    organization_name: profile.organization_name,
    organization_type: profile.organization_type,
    location: profile.location || '',
    role: profile.role,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      organization_name: profile.organization_name,
      organization_type: profile.organization_type,
      location: profile.location || '',
      role: profile.role,
    })
    setIsEditing(false)
    setError('')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl">Organization Details</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Information about your organization
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization_name" className="text-sm">
                Organization Name *
              </Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) =>
                  setFormData({ ...formData, organization_name: e.target.value })
                }
                required
                disabled={loading}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_type" className="text-sm">
                Organization Type *
              </Label>
              <Select
                value={formData.organization_type}
                onValueChange={(value: 'lab' | 'clinic' | 'hospital') =>
                  setFormData({ ...formData, organization_type: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="organization_type">
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
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., New York, USA"
                disabled={loading}
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
                disabled={loading}
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

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Organization Name</p>
                <p className="font-medium text-sm sm:text-base">{profile.organization_name}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Organization Type</p>
                <p className="font-medium text-sm sm:text-base capitalize">
                  {profile.organization_type === 'lab' ? 'IVF Laboratory' : 
                   profile.organization_type === 'clinic' ? 'Fertility Clinic' : 
                   'Hospital'}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Location</p>
                <p className="font-medium text-sm sm:text-base">
                  {profile.location || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Your Role</p>
                <p className="font-medium text-sm sm:text-base capitalize">
                  {profile.role === 'lab_manager' ? 'Lab Manager' : 
                   profile.role === 'admin' ? 'Administrator' : 
                   'Technician'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

