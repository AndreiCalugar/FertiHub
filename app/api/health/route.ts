import { NextResponse } from 'next/server'

/**
 * Health check endpoint to diagnose deployment issues
 * GET /api/health
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      sendgridKey: !!process.env.SENDGRID_API_KEY,
      sendgridEmail: !!process.env.SENDGRID_FROM_EMAIL,
      cronSecret: !!process.env.CRON_SECRET,
    },
    missing: [] as string[],
  }

  // Check for missing required variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    health.missing.push('NEXT_PUBLIC_SUPABASE_URL')
    health.status = 'error'
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    health.missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    health.status = 'error'
  }

  // Optional variables (warnings only)
  const warnings = [] as string[]
  if (!process.env.SENDGRID_API_KEY) warnings.push('SENDGRID_API_KEY (email features disabled)')
  if (!process.env.SENDGRID_FROM_EMAIL) warnings.push('SENDGRID_FROM_EMAIL (email features disabled)')
  if (!process.env.CRON_SECRET) warnings.push('CRON_SECRET (cron jobs disabled)')

  return NextResponse.json({
    ...health,
    warnings: warnings.length > 0 ? warnings : undefined,
    message: health.status === 'ok' 
      ? 'All required environment variables are configured' 
      : 'Missing required environment variables',
  }, { 
    status: health.status === 'ok' ? 200 : 500 
  })
}

