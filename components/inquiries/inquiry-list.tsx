'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Calendar, Package, Users, MoreVertical, Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InquiryDeleteDialog } from './inquiry-delete-dialog'

interface InquiryListProps {
  inquiries: any[]
}

export function InquiryList({ inquiries }: InquiryListProps) {
  const router = useRouter()
  const [deleteInquiry, setDeleteInquiry] = useState<{ id: string; description: string } | null>(null)

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
    <>
      <div className="space-y-3 sm:space-y-4">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="block p-4 sm:p-6 rounded-lg border hover:border-indigo-300 hover:shadow-md transition-all bg-white"
          >
            <div className="flex items-start gap-2">
              <Link href={`/dashboard/inquiries/${inquiry.id}`} className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                      {inquiry.product_category?.name || 'Product'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                      {inquiry.product_description}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(inquiry.status)} flex-shrink-0 text-xs`} variant="outline">
                    {inquiry.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{new Date(inquiry.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    Qty: {inquiry.quantity}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">
                      {inquiry.inquiry_suppliers?.length || 0} supplier
                      {inquiry.inquiry_suppliers?.length !== 1 ? 's' : ''}
                    </span>
                    <span className="sm:hidden">{inquiry.inquiry_suppliers?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                      inquiry.urgency_level >= 4
                        ? 'bg-red-100 text-red-700'
                        : inquiry.urgency_level === 3
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      <span className="hidden sm:inline">Priority:</span> {inquiry.urgency_level}/5
                    </span>
                  </div>
                </div>
              </Link>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/inquiries/${inquiry.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={(e) => {
                      e.preventDefault()
                      setDeleteInquiry({ 
                        id: inquiry.id, 
                        description: inquiry.product_description 
                      })
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Dialog */}
      {deleteInquiry && (
        <InquiryDeleteDialog
          inquiryId={deleteInquiry.id}
          productDescription={deleteInquiry.description}
          open={!!deleteInquiry}
          onOpenChange={(open) => !open && setDeleteInquiry(null)}
        />
      )}
    </>
  )
}

