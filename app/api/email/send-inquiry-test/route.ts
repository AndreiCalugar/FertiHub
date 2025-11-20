import { NextRequest, NextResponse } from 'next/server'

// Simple test route without dependencies
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Test route is working!',
    timestamp: new Date().toISOString()
  })
}

