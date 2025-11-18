import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { InquiryForm } from '@/components/inquiries/inquiry-form'

export default async function NewInquiryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch suppliers
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('created_by', user!.id)
    .order('name')

  // Fetch product categories
  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .order('name')

  return (
    <div className="p-8 space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/inquiries">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Inquiries
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create Inquiry</h1>
        <p className="text-gray-600 mt-1">Request quotes from your suppliers</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Inquiry Details</CardTitle>
          <CardDescription>
            Fill in the product information and select suppliers to contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InquiryForm suppliers={suppliers || []} categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  )
}

