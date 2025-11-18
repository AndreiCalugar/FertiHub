import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SupplierList } from '@/components/suppliers/supplier-list'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('created_by', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your supplier contacts</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Suppliers</CardTitle>
          <CardDescription>
            {suppliers?.length || 0} supplier{suppliers?.length !== 1 ? 's' : ''} in your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierList suppliers={suppliers || []} />
        </CardContent>
      </Card>
    </div>
  )
}

