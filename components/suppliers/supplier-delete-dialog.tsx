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
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SupplierDeleteDialogProps {
  supplierId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupplierDeleteDialog({
  supplierId,
  open,
  onOpenChange,
}: SupplierDeleteDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!supplierId) return

    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId)

    if (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Failed to delete supplier')
    } else {
      toast.success('Supplier deleted successfully')
      onOpenChange(false)
      router.refresh()
    }

    setIsDeleting(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this supplier? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

