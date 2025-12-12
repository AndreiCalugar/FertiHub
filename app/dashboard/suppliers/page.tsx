import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Plus, Star } from 'lucide-react'
import { SupplierList } from '@/components/suppliers/supplier-list'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('created_by', user!.id)
    .order('is_favorite', { ascending: false })
    .order('name', { ascending: true })

  const favorites = suppliers?.filter(s => s.is_favorite) || []
  const allSuppliers = suppliers || []

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Suppliers</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your supplier contacts</p>
        </div>
        <Button asChild size="sm" className="sm:size-default self-start sm:self-auto">
          <Link href="/dashboard/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">All Suppliers</span>
            <span className="sm:hidden">All</span>
            <span className="ml-1">({allSuppliers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs sm:text-sm">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 fill-yellow-400 text-yellow-400" />
            <span className="hidden sm:inline">Favorites</span>
            <span className="sm:hidden">Fav</span>
            <span className="ml-1">({favorites.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Suppliers</CardTitle>
              <CardDescription>
                {allSuppliers.length} supplier{allSuppliers.length !== 1 ? 's' : ''} in your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierList suppliers={allSuppliers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Suppliers</CardTitle>
              <CardDescription>
                {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierList suppliers={favorites} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

