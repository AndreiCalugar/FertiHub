'use client'

import Link from 'next/link'
import { FileText, Calendar, Package, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface InquiryListProps {
  inquiries: any[]
}

export function InquiryList({ inquiries }: InquiryListProps) {
  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">No inquiries yet</p>
        <p className="text-sm mb-6">Create your first inquiry to request quotes from suppliers</p>
        <Button asChild>
          <Link href="/dashboard/inquiries/new">Create Inquiry</Link>
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'partial':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Link
          key={inquiry.id}
          href={`/dashboard/inquiries/${inquiry.id}`}
          className="block p-6 rounded-lg border hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {inquiry.product_category?.name || 'Product'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {inquiry.product_description}
                  </p>
                </div>
                <Badge className={getStatusColor(inquiry.status)} variant="outline">
                  {inquiry.status}
                </Badge>
              </div>

              {/* Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Qty: {inquiry.quantity}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {inquiry.inquiry_suppliers?.length || 0} supplier
                  {inquiry.inquiry_suppliers?.length !== 1 ? 's' : ''} contacted
                </div>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    inquiry.urgency_level >= 4
                      ? 'bg-red-100 text-red-700'
                      : inquiry.urgency_level === 3
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    Priority: {inquiry.urgency_level}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

