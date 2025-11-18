'use client'

import { useState } from 'react'
import { Supplier } from '@/lib/types/database.types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Mail, Phone, Globe, Users } from 'lucide-react'
import Link from 'next/link'
import { SupplierDeleteDialog } from './supplier-delete-dialog'

interface SupplierListProps {
  suppliers: Supplier[]
}

export function SupplierList({ suppliers }: SupplierListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
      <div className="rounded-md border">
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

