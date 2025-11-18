import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SupplierForm } from '@/components/suppliers/supplier-form'

export default function NewSupplierPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/suppliers">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add Supplier</h1>
        <p className="text-gray-600 mt-1">Add a new supplier to your network</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
          <CardDescription>
            Enter the supplier's contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierForm />
        </CardContent>
      </Card>
    </div>
  )
}

