'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Supplier } from '@/lib/types/database.types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Mail, Phone, Globe, Users, Star } from 'lucide-react'
import Link from 'next/link'
import { SupplierDeleteDialog } from './supplier-delete-dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SupplierListProps {
  suppliers: Supplier[]
}

export function SupplierList({ suppliers }: SupplierListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null)

  const toggleFavorite = async (supplierId: string, currentStatus: boolean) => {
    setTogglingFavorite(supplierId)
    const supabase = createClient()

    const { error } = await supabase
      .from('suppliers')
      .update({ is_favorite: !currentStatus })
      .eq('id', supplierId)

    if (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite')
    } else {
      toast.success(currentStatus ? 'Removed from favorites' : 'Added to favorites')
      router.refresh()
    }

    setTogglingFavorite(null)
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">No suppliers yet</p>
        <p className="text-sm mb-6">Add your first supplier to start sending inquiries</p>
        <Button asChild>
          <Link href="/dashboard/suppliers/new">Add Supplier</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile view - Cards */}
      <div className="lg:hidden space-y-4">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="border rounded-lg p-4 space-y-3 bg-white">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={() => toggleFavorite(supplier.id, supplier.is_favorite)}
                  disabled={togglingFavorite === supplier.id}
                  className="focus:outline-none disabled:opacity-50 flex-shrink-0"
                >
                  <Star
                    className={`h-5 w-5 ${
                      supplier.is_favorite
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    } transition-colors`}
                  />
                </button>
                <h3 className="font-semibold text-base truncate">{supplier.name}</h3>
              </div>
              {supplier.is_verified ? (
                <Badge variant="default" className="flex-shrink-0">Verified</Badge>
              ) : (
                <Badge variant="secondary" className="flex-shrink-0">Unverified</Badge>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              {supplier.contact_person && (
                <div>
                  <span className="text-gray-500">Contact:</span>
                  <p className="font-medium">{supplier.contact_person}</p>
                </div>
              )}
              <a 
                href={`mailto:${supplier.email}`} 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{supplier.email}</span>
              </a>
              {supplier.phone && (
                <a 
                  href={`tel:${supplier.phone}`} 
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  {supplier.phone}
                </a>
              )}
              {supplier.website && (
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Visit website</span>
                </a>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteId(supplier.id)}
                className="flex-shrink-0"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden lg:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(supplier.id, supplier.is_favorite)}
                      disabled={togglingFavorite === supplier.id}
                      className="focus:outline-none disabled:opacity-50"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          supplier.is_favorite
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        } transition-colors`}
                      />
                    </button>
                    {supplier.name}
                    {supplier.website && (
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>{supplier.contact_person || '-'}</TableCell>
                <TableCell>
                  <a
                    href={`mailto:${supplier.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="h-4 w-4" />
                    {supplier.email}
                  </a>
                </TableCell>
                <TableCell>
                  {supplier.phone ? (
                    <a
                      href={`tel:${supplier.phone}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                    >
                      <Phone className="h-4 w-4" />
                      {supplier.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {supplier.is_verified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SupplierDeleteDialog
        supplierId={deleteId}
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      />
    </>
  )
}

