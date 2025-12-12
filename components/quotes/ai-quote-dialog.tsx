'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Sparkles, AlertTriangle, Check, Loader2 } from 'lucide-react'

interface AiQuoteDialogProps {
  inquiryId: string
  suppliers: any[]
}

export function AiQuoteDialog({ inquiryId, suppliers }: AiQuoteDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [step, setStep] = useState<'paste' | 'review'>('paste')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailText, setEmailText] = useState('')
  const [parsedData, setParsedData] = useState<any>(null)

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

  const handleParse = async () => {
    if (!emailText.trim()) {
      setError('Please paste the email or quote text')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/quotes/parse-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: emailText,
          inquiryId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to parse quote')
      }

      const { parsedQuote } = await response.json()
      setParsedData(parsedQuote)

      // Pre-fill form with parsed data
      setFormData({
        supplier_id: '',
        product_name: parsedQuote.product_name || '',
        unit_price: parsedQuote.unit_price?.toString() || '',
        total_price: parsedQuote.total_price?.toString() || '',
        currency: parsedQuote.currency || 'USD',
        lead_time_days: parsedQuote.lead_time_days?.toString() || '',
        validity_period: parsedQuote.validity_period || '',
        notes: parsedQuote.notes || '',
      })

      setStep('review')
      toast.success('Quote parsed successfully! Please review and confirm.')
    } catch (err: any) {
      setError(err.message || 'Failed to parse quote')
      toast.error('AI parsing failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.supplier_id || !formData.product_name || !formData.total_price) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          inquiry_id: inquiryId,
          ai_extracted: true,
          confidence_score: parsedData?.confidence_score || 0,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create quote')
      }

      toast.success('Quote added successfully!')
      handleClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      toast.error('Failed to add quote')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('paste')
    setEmailText('')
    setParsedData(null)
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
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Sparkles className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">AI Extract</span>
          <span className="sm:hidden">AI</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Quote Extraction
          </DialogTitle>
          <DialogDescription>
            {step === 'paste'
              ? 'Paste the email or quote text below and let AI extract the data'
              : 'Review and confirm the extracted quote data'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {step === 'paste' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailText">
                Email or Quote Text *
              </Label>
              <Textarea
                id="emailText"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste the email content or quote text here..."
                rows={12}
                className="font-mono text-sm"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                AI will extract product name, pricing, lead time, and other details
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleParse}
                disabled={loading || !emailText.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parse with AI
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Confidence Badge */}
            {parsedData && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Confidence Score:</span>
                  <Badge
                    variant={
                      parsedData.confidence_score >= 0.8
                        ? 'default'
                        : parsedData.confidence_score >= 0.6
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {(parsedData.confidence_score * 100).toFixed(0)}%
                  </Badge>
                </div>
                {parsedData.needs_review && (
                  <div className="flex items-center gap-1 text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Please review carefully</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, supplier_id: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="supplier">
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
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_price">Total Price *</Label>
                <Input
                  id="total_price"
                  type="number"
                  step="0.01"
                  value={formData.total_price}
                  onChange={(e) =>
                    setFormData({ ...formData, total_price: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead_time">Lead Time (days)</Label>
                <Input
                  id="lead_time"
                  type="number"
                  value={formData.lead_time_days}
                  onChange={(e) =>
                    setFormData({ ...formData, lead_time_days: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity">Validity Period</Label>
              <Input
                id="validity"
                value={formData.validity_period}
                onChange={(e) =>
                  setFormData({ ...formData, validity_period: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                disabled={loading}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('paste')}
                disabled={loading}
              >
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirm & Add Quote
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

