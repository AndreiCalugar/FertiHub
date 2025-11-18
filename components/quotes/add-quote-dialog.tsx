'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus } from 'lucide-react'

interface AddQuoteDialogProps {
  inquiryId: string
  suppliers: any[]
}

export function AddQuoteDialog({ inquiryId, suppliers }: AddQuoteDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    supplier_id: '',
    product_name: '',
    unit_price: '',
    total_price: '',
    currency: 'USD',
    lead_time_days: '',
    validity_period: '',
    notes: '',
  })

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      product_name: '',
      unit_price: '',
      total_price: '',
      currency: 'USD',
      lead_time_days: '',
      validity_period: '',
      notes: '',
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase.from('quotes').insert({
        inquiry_id: inquiryId,
        supplier_id: formData.supplier_id,
        product_name: formData.product_name,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        total_price: parseFloat(formData.total_price),
        currency: formData.currency,
        lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : null,
        validity_period: formData.validity_period || null,
        notes: formData.notes || null,
        manually_entered: true,
      })

      if (insertError) throw insertError

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Quote Manually</DialogTitle>
          <DialogDescription>
            Enter quote details received from a supplier
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="supplier_id">Supplier *</Label>
            <Select
              value={formData.supplier_id}
              onValueChange={(value) =>
                setFormData({ ...formData, supplier_id: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="supplier_id">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name/Model *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              placeholder="e.g., IncuSafe MCO-5AC"
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({ ...formData, unit_price: e.target.value })
                }
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_price">Total Price *</Label>
              <Input
                id="total_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_price}
                onChange={(e) =>
                  setFormData({ ...formData, total_price: e.target.value })
                }
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead_time_days">Lead Time (days)</Label>
              <Input
                id="lead_time_days"
                type="number"
                min="0"
                value={formData.lead_time_days}
                onChange={(e) =>
                  setFormData({ ...formData, lead_time_days: e.target.value })
                }
                placeholder="e.g., 30"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity_period">Validity Period</Label>
              <Input
                id="validity_period"
                value={formData.validity_period}
                onChange={(e) =>
                  setFormData({ ...formData, validity_period: e.target.value })
                }
                placeholder="e.g., 30 days"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional information..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Quote'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

