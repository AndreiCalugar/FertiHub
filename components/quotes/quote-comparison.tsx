'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, TrendingDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import { QuoteActions } from './quote-actions'

interface QuoteComparisonProps {
  quotes: any[]
  inquiryId: string
  suppliers: any[]
}

export function QuoteComparison({ quotes, inquiryId, suppliers }: QuoteComparisonProps) {
  const [exporting, setExporting] = useState(false)

  if (!quotes || quotes.length === 0) {
    return null
  }

  // Find lowest price
  const lowestPrice = Math.min(...quotes.map((q) => q.total_price))

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
    }
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`
  }

  const exportToExcel = () => {
    setExporting(true)

    try {
      // Prepare data for Excel
      const data = quotes.map((quote, index) => ({
        'Rank': index + 1,
        'Supplier': quote.supplier?.name || 'Unknown',
        'Product': quote.product_name,
        'Unit Price': quote.unit_price ? `${quote.currency} ${quote.unit_price}` : '-',
        'Total Price': `${quote.currency} ${quote.total_price}`,
        'Lead Time': quote.lead_time_days ? `${quote.lead_time_days} days` : '-',
        'Validity': quote.validity_period || '-',
        'Notes': quote.notes || '-',
        'Created': new Date(quote.created_at).toLocaleDateString(),
      }))

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data)

      // Set column widths
      ws['!cols'] = [
        { wch: 6 },  // Rank
        { wch: 25 }, // Supplier
        { wch: 30 }, // Product
        { wch: 12 }, // Unit Price
        { wch: 12 }, // Total Price
        { wch: 12 }, // Lead Time
        { wch: 15 }, // Validity
        { wch: 30 }, // Notes
        { wch: 12 }, // Created
      ]

      // Create workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Quotes')

      // Generate filename with inquiry ID and date
      const filename = `quotes_${inquiryId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.xlsx`

      // Save file
      XLSX.writeFile(wb, filename)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Failed to export to Excel')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportToExcel} disabled={exporting} size="sm" className="lg:size-default">
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export to Excel'}</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Mobile view - Cards */}
      <div className="lg:hidden space-y-4">
        {quotes.map((quote) => {
          const isLowestPrice = quote.total_price === lowestPrice
          return (
            <div 
              key={quote.id} 
              className={`border rounded-lg p-4 space-y-3 ${isLowestPrice ? 'bg-green-50 border-green-200' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base">{quote.supplier?.name || 'Unknown'}</h3>
                {isLowestPrice && (
                  <Badge variant="default" className="bg-green-600 flex-shrink-0">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Lowest
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Product</span>
                  <p className="font-medium">{quote.product_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 text-xs">Unit Price</span>
                    <p className="font-medium">
                      {quote.unit_price ? formatCurrency(quote.unit_price, quote.currency) : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Total Price</span>
                    <p className="font-semibold text-lg">
                      {formatCurrency(quote.total_price, quote.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Lead Time</span>
                    <p>{quote.lead_time_days ? `${quote.lead_time_days} days` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Validity</span>
                    <p>{quote.validity_period || '-'}</p>
                  </div>
                </div>
                {quote.notes && (
                  <div>
                    <span className="text-gray-500 text-xs">Notes</span>
                    <p className="text-gray-900 text-sm mt-1">{quote.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <QuoteActions quoteId={quote.id} inquiryId={inquiryId} suppliers={suppliers} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden lg:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total Price</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => {
              const isLowestPrice = quote.total_price === lowestPrice

              return (
                <TableRow key={quote.id} className={isLowestPrice ? 'bg-green-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {quote.supplier?.name || 'Unknown'}
                      {isLowestPrice && (
                        <Badge variant="default" className="bg-green-600">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Lowest
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{quote.product_name}</TableCell>
                  <TableCell className="text-right">
                    {quote.unit_price ? formatCurrency(quote.unit_price, quote.currency) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(quote.total_price, quote.currency)}
                  </TableCell>
                  <TableCell>
                    {quote.lead_time_days ? `${quote.lead_time_days} days` : '-'}
                  </TableCell>
                  <TableCell>{quote.validity_period || '-'}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {quote.notes || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <QuoteActions quoteId={quote.id} inquiryId={inquiryId} suppliers={suppliers} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
        <p>
          <span className="font-medium">Best offer:</span>{' '}
          <span className="font-semibold text-green-700">
            {formatCurrency(lowestPrice, quotes.find((q) => q.total_price === lowestPrice)?.currency || 'USD')}
          </span>
          {' from '}
          <span className="font-medium">{quotes.find((q) => q.total_price === lowestPrice)?.supplier?.name}</span>
        </p>
      </div>
    </div>
  )
}

