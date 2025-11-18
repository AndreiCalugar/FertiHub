'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, XCircle, Mail } from 'lucide-react'

interface InquirySupplierStatusProps {
  inquiryId: string
  inquirySuppliers: any[]
}

export function InquirySupplierStatus({
  inquiryId,
  inquirySuppliers,
}: InquirySupplierStatusProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleFollowUp = async (supplierId: string) => {
    setLoadingId(supplierId)

    try {
      const response = await fetch('/api/email/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId,
          supplierIds: [supplierId],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send follow-up')
      }

      router.refresh()
    } catch (error) {
      console.error('Error sending follow-up:', error)
      alert('Failed to send follow-up email')
    } finally {
      setLoadingId(null)
    }
  }

  const getEmailStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-3">
      {inquirySuppliers.map((inquirySupplier: any) => (
        <div
          key={inquirySupplier.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1">
              <p className="font-medium">{inquirySupplier.supplier?.name}</p>
              <p className="text-sm text-gray-600">
                {inquirySupplier.supplier?.email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {getEmailStatusIcon(inquirySupplier.email_status)}
              <span className="text-sm text-gray-600">
                {inquirySupplier.email_sent_at
                  ? `Sent ${new Date(inquirySupplier.email_sent_at).toLocaleDateString()}`
                  : 'Not sent'}
              </span>
            </div>

            {inquirySupplier.response_received ? (
              <Badge variant="default">Responded</Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>

          {!inquirySupplier.response_received && inquirySupplier.email_sent_at && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFollowUp(inquirySupplier.supplier.id)}
              disabled={loadingId === inquirySupplier.supplier.id}
            >
              <Mail className="h-4 w-4 mr-2" />
              {loadingId === inquirySupplier.supplier.id
                ? 'Sending...'
                : 'Follow Up'}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

