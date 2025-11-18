'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { toast } from 'sonner'

interface InquiryFormProps {
  suppliers: any[]
  categories: any[]
}

export function InquiryForm({ suppliers, categories }: InquiryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

  const [formData, setFormData] = useState({
    product_category_id: '',
    product_description: '',
    quantity: 1,
    urgency_level: 3,
    notes: '',
  })

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    )
  }

  const selectAllSuppliers = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([])
    } else {
      setSelectedSuppliers(suppliers.map((s) => s.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedSuppliers.length === 0) {
      setError('Please select at least one supplier')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated')
        return
      }

      // Create inquiry
      const { data: inquiry, error: inquiryError } = await supabase
        .from('inquiries')
        .insert({
          user_id: user.id,
          product_category_id: formData.product_category_id || null,
          product_description: formData.product_description,
          quantity: formData.quantity,
          urgency_level: formData.urgency_level,
          notes: formData.notes || null,
          status: 'draft',
        })
        .select()
        .single()

      if (inquiryError) throw inquiryError

      // Create inquiry-supplier relationships
      const inquirySuppliers = selectedSuppliers.map((supplierId) => ({
        inquiry_id: inquiry.id,
        supplier_id: supplierId,
        email_status: 'pending',
      }))

      const { error: suppliersError } = await supabase
        .from('inquiry_suppliers')
        .insert(inquirySuppliers)

      if (suppliersError) throw suppliersError

      // Send emails
      const response = await fetch('/api/email/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId: inquiry.id }),
      })

      if (!response.ok) {
        console.error('Failed to send emails')
        toast.warning('Inquiry created but some emails failed to send')
      } else {
        toast.success('Inquiry created and emails sent successfully!')
      }

      router.push(`/dashboard/inquiries/${inquiry.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      toast.error('Failed to create inquiry')
      setLoading(false)
    }
  }

  if (suppliers.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          You need to add suppliers before creating an inquiry.{' '}
          <Link href="/dashboard/suppliers/new" className="font-medium text-indigo-600 hover:text-indigo-700">
            Add your first supplier
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Product Details */}
      <div className="space-y-4">
        <h3 className="font-semibold">Product Information</h3>

        <div className="space-y-2">
          <Label htmlFor="category">Product Category</Label>
          <Select
            value={formData.product_category_id}
            onValueChange={(value) =>
              setFormData({ ...formData, product_category_id: value })
            }
            disabled={loading}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Product Description *</Label>
          <Textarea
            id="description"
            value={formData.product_description}
            onChange={(e) =>
              setFormData({ ...formData, product_description: e.target.value })
            }
            placeholder="Describe the product you need in detail..."
            rows={4}
            required
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level *</Label>
            <Select
              value={formData.urgency_level.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, urgency_level: parseInt(value) })
              }
              disabled={loading}
            >
              <SelectTrigger id="urgency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Low</SelectItem>
                <SelectItem value="2">2 - Medium-Low</SelectItem>
                <SelectItem value="3">3 - Medium</SelectItem>
                <SelectItem value="4">4 - High</SelectItem>
                <SelectItem value="5">5 - Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special requirements or additional information..."
            rows={3}
            disabled={loading}
          />
        </div>
      </div>

      <Separator />

      {/* Supplier Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Select Suppliers *</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAllSuppliers}
            disabled={loading}
          >
            {selectedSuppliers.length === suppliers.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="flex items-start space-x-3">
              <Checkbox
                id={supplier.id}
                checked={selectedSuppliers.includes(supplier.id)}
                onCheckedChange={() => toggleSupplier(supplier.id)}
                disabled={loading}
              />
              <div className="flex-1">
                <label
                  htmlFor={supplier.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {supplier.name}
                </label>
                <p className="text-sm text-gray-600 mt-1">{supplier.email}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600">
          {selectedSuppliers.length} supplier{selectedSuppliers.length !== 1 ? 's' : ''}{' '}
          selected
        </p>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/inquiries')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create & Send Inquiry'}
        </Button>
      </div>
    </form>
  )
}

