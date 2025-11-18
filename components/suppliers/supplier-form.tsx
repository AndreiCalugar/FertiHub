'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Supplier } from '@/lib/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface SupplierFormProps {
  supplier?: Supplier
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    contact_person: supplier?.contact_person || '',
    phone: supplier?.phone || '',
    website: supplier?.website || '',
    notes: supplier?.notes || '',
    is_favorite: supplier?.is_favorite || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated')
        return
      }

      if (supplier) {
        // Update existing supplier
        const { error: updateError } = await supabase
          .from('suppliers')
          .update({
            name: formData.name,
            email: formData.email,
            contact_person: formData.contact_person || null,
            phone: formData.phone || null,
            website: formData.website || null,
            notes: formData.notes || null,
            is_favorite: formData.is_favorite,
          })
          .eq('id', supplier.id)

        if (updateError) throw updateError
        toast.success('Supplier updated successfully')
      } else {
        // Create new supplier
        const { error: insertError } = await supabase
          .from('suppliers')
          .insert({
            name: formData.name,
            email: formData.email,
            contact_person: formData.contact_person || null,
            phone: formData.phone || null,
            website: formData.website || null,
            notes: formData.notes || null,
            is_favorite: formData.is_favorite,
            created_by: user.id,
          })

        if (insertError) throw insertError
        toast.success('Supplier added successfully')
      }

      router.push('/dashboard/suppliers')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      toast.error('Failed to save supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Company Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Cooper Surgical"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="sales@example.com"
          required
          disabled={loading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) =>
              setFormData({ ...formData, contact_person: e.target.value })
            }
            placeholder="John Doe"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 234 567 8900"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://www.example.com"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional information about this supplier..."
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_favorite"
          checked={formData.is_favorite}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_favorite: checked as boolean })
          }
          disabled={loading}
        />
        <Label
          htmlFor="is_favorite"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Mark as favorite supplier
        </Label>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/suppliers')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Add Supplier'}
        </Button>
      </div>
    </form>
  )
}

