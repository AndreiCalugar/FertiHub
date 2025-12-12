import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ChevronLeft, Mail, Clock, Package, AlertCircle, Paperclip, Download, Calendar, Trash2 } from 'lucide-react'
import { InquirySupplierStatus } from '@/components/inquiries/inquiry-supplier-status'
import { QuoteComparison } from '@/components/quotes/quote-comparison'
import { AddQuoteDialog } from '@/components/quotes/add-quote-dialog'
import { InquiryDeleteButton } from '@/components/inquiries/inquiry-delete-button'

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select(`
      *,
      product_category:product_categories(*),
      inquiry_suppliers(
        *,
        supplier:suppliers(*)
      )
    `)
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!inquiry) {
    redirect('/dashboard/inquiries')
  }

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, supplier:suppliers(*)')
    .eq('inquiry_id', id)
    .order('total_price')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'partial':
        return 'bg-yellow-100 text-yellow-700'
      case 'sent':
        return 'bg-blue-100 text-blue-700'
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-3 sm:mb-4 -ml-2" size="sm">
          <Link href="/dashboard/inquiries">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Inquiries
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Inquiry Details</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Created on {new Date(inquiry.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Badge className={getStatusColor(inquiry.status)}>
              {inquiry.status}
            </Badge>
            <InquiryDeleteButton 
              inquiryId={inquiry.id} 
              productDescription={inquiry.product_description}
            />
          </div>
        </div>
      </div>

      {/* Inquiry Information */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Category</p>
              <p className="font-medium text-sm sm:text-base">
                {inquiry.product_category?.name || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Quantity</p>
              <p className="font-medium text-sm sm:text-base">{inquiry.quantity}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Urgency Level</p>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  inquiry.urgency_level >= 4
                    ? 'bg-red-100 text-red-700'
                    : inquiry.urgency_level === 3
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {inquiry.urgency_level}/5
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Status</p>
              <p className="font-medium text-sm sm:text-base capitalize">{inquiry.status}</p>
            </div>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Description</p>
            <p className="text-sm sm:text-base text-gray-900">{inquiry.product_description}</p>
          </div>

          {inquiry.notes && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Additional Notes</p>
              <p className="text-sm sm:text-base text-gray-900">{inquiry.notes}</p>
            </div>
          )}

          {inquiry.attachment_url && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Attachment</p>
              <a
                href={inquiry.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <Paperclip className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">View Document</span>
                <Download className="h-4 w-4 flex-shrink-0" />
              </a>
            </div>
          )}

          {inquiry.deadline_date && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Response Deadline</p>
              <div className="flex flex-wrap items-center gap-2 text-gray-900">
                <Calendar className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">
                  {new Date(inquiry.deadline_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {new Date(inquiry.deadline_date) < new Date() && (
                  <Badge variant="destructive" className="text-xs">Overdue</Badge>
                )}
                {new Date(inquiry.deadline_date) > new Date() && 
                 new Date(inquiry.deadline_date).getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000 && (
                  <Badge className="bg-orange-500 text-xs">Approaching</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Status */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Status</CardTitle>
          <CardDescription>
            {inquiry.inquiry_suppliers?.length || 0} supplier
            {inquiry.inquiry_suppliers?.length !== 1 ? 's' : ''} contacted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InquirySupplierStatus
            inquiryId={inquiry.id}
            inquirySuppliers={inquiry.inquiry_suppliers || []}
          />
        </CardContent>
      </Card>

      {/* Quotes Comparison */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Quotes Received</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {quotes?.length || 0} quote{quotes?.length !== 1 ? 's' : ''} received
            </CardDescription>
          </div>
          <AddQuoteDialog
            inquiryId={inquiry.id}
            suppliers={inquiry.inquiry_suppliers?.map((is: any) => is.supplier) || []}
          />
        </CardHeader>
        <CardContent>
          {quotes && quotes.length > 0 ? (
            <QuoteComparison quotes={quotes} inquiryId={inquiry.id} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No quotes yet</p>
              <p className="text-sm mb-6">
                Waiting for suppliers to respond, or add quotes manually
              </p>
              <AddQuoteDialog
                inquiryId={inquiry.id}
                suppliers={inquiry.inquiry_suppliers?.map((is: any) => is.supplier) || []}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

