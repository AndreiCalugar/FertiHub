import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { InquiryList } from '@/components/inquiries/inquiry-list'

export default async function InquiriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select(`
      *,
      product_category:product_categories(*),
      inquiry_suppliers(
        id,
        supplier:suppliers(*)
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Inquiries</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your quote requests</p>
        </div>
        <Button asChild size="sm" className="sm:size-default self-start sm:self-auto">
          <Link href="/dashboard/inquiries/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Inquiry
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
          <CardDescription>
            {inquiries?.length || 0} quote request{inquiries?.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InquiryList inquiries={inquiries || []} />
        </CardContent>
      </Card>
    </div>
  )
}

