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
    deadline_date: '',
  })
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

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

      let attachmentUrl = null

      // Upload attachment if provided
      if (attachmentFile) {
        setUploading(true)
        const fileExt = attachmentFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('inquiry-attachments')
          .upload(fileName, attachmentFile)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error('Failed to upload attachment')
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('inquiry-attachments')
            .getPublicUrl(fileName)
          attachmentUrl = publicUrl
        }
        setUploading(false)
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
          attachment_url: attachmentUrl,
          deadline_date: formData.deadline_date || null,
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
      const response = await fetch('/api/send-inquiry-emails', {
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Product Details */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-semibold text-base sm:text-lg">Product Information</h3>

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

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm">Quantity *</Label>
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
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency" className="text-sm">Urgency Level *</Label>
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

        <div className="space-y-2">
          <Label htmlFor="attachment">Attachment (Optional)</Label>
          <Input
            id="attachment"
            type="file"
            onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
            disabled={loading || uploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
          <p className="text-xs text-gray-500">
            Upload spec sheets, requirements, or product images (Max 10MB)
          </p>
          {attachmentFile && (
            <p className="text-sm text-green-600">
              Selected: {attachmentFile.name} ({(attachmentFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline_date">Response Deadline (Optional)</Label>
          <Input
            id="deadline_date"
            type="date"
            value={formData.deadline_date}
            onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
            disabled={loading}
            min={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-gray-500">
            Set a deadline for suppliers to respond. You'll receive reminders as it approaches.
          </p>
        </div>
      </div>

      <Separator />

      {/* Supplier Selection */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="font-semibold text-base sm:text-lg">Select Suppliers *</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAllSuppliers}
            disabled={loading}
            className="self-start"
          >
            {selectedSuppliers.length === suppliers.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3 sm:p-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="flex items-start space-x-3">
              <Checkbox
                id={supplier.id}
                checked={selectedSuppliers.includes(supplier.id)}
                onCheckedChange={() => toggleSupplier(supplier.id)}
                disabled={loading}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={supplier.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block"
                >
                  {supplier.name}
                </label>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{supplier.email}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs sm:text-sm text-gray-600">
          {selectedSuppliers.length} supplier{selectedSuppliers.length !== 1 ? 's' : ''}{' '}
          selected
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/inquiries')}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploading} className="w-full sm:w-auto">
          {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create & Send'}
        </Button>
      </div>
    </form>
  )
}

