'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface InquiryDeleteDialogProps {
  inquiryId: string
  productDescription: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InquiryDeleteDialog({ 
  inquiryId, 
  productDescription,
  open, 
  onOpenChange 
}: InquiryDeleteDialogProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch('/api/inquiries/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete inquiry')
      }

      toast.success('Inquiry deleted successfully')
      router.push('/dashboard/inquiries')
      router.refresh()
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      toast.error('Failed to delete inquiry')
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the inquiry for <strong>"{productDescription}"</strong>?
            <br /><br />
            This action cannot be undone. This will permanently delete:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The inquiry</li>
              <li>All associated quotes</li>
              <li>All related notifications</li>
              <li>Supplier communication history</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Deleting...' : 'Delete Inquiry'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

