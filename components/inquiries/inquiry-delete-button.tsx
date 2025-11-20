'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { InquiryDeleteDialog } from './inquiry-delete-dialog'

interface InquiryDeleteButtonProps {
  inquiryId: string
  productDescription: string
}

export function InquiryDeleteButton({ inquiryId, productDescription }: InquiryDeleteButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Inquiry
      </Button>
      <InquiryDeleteDialog
        inquiryId={inquiryId}
        productDescription={productDescription}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

