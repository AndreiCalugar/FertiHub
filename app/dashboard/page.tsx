import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText, Users, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch statistics
  const { count: inquiriesCount } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .in('status', ['sent', 'partial'])

  const { count: quotesCount } = await supabase
    .from('quotes')
    .select('*, inquiry:inquiries!inner(*)', { count: 'exact', head: true })
    .eq('inquiry.user_id', user!.id)

  const { count: suppliersCount } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user!.id)

  // Fetch recent inquiries
  const { data: recentInquiries } = await supabase
    .from('inquiries')
    .select('*, product_category:product_categories(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8 space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Inquiries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiriesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Quote requests in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Received from suppliers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your network
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/dashboard/inquiries/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Inquiry
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/suppliers">
              <Users className="mr-2 h-4 w-4" />
              Manage Suppliers
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/inquiries">
              <FileText className="mr-2 h-4 w-4" />
              View Inquiries
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Inquiries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
          <CardDescription>Your latest quote requests</CardDescription>
        </CardHeader>
        <CardContent>
          {recentInquiries && recentInquiries.length > 0 ? (
            <div className="space-y-4">
              {recentInquiries.map((inquiry: any) => (
                <Link
                  key={inquiry.id}
                  href={`/dashboard/inquiries/${inquiry.id}`}
                  className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {inquiry.product_category?.name || 'Product'}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {inquiry.product_description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inquiry.status === 'completed' ? 'bg-green-100 text-green-700' :
                      inquiry.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      inquiry.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {inquiry.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm">No inquiries yet</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/inquiries/new">
                  Create Your First Inquiry
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

