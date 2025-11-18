import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SupplierForm } from '@/components/suppliers/supplier-form'

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .eq('created_by', user!.id)
    .single()

  if (!supplier) {
    redirect('/dashboard/suppliers')
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/suppliers">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Supplier</h1>
        <p className="text-gray-600 mt-1">Update supplier information</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
          <CardDescription>
            Update the supplier's contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierForm supplier={supplier} />
        </CardContent>
      </Card>
    </div>
  )
}

