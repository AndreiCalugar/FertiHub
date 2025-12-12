import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Note: Next.js 16 shows a deprecation warning about middleware → proxy
// Keeping current implementation until official migration guide is available
// This follows Supabase's official Next.js integration pattern
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

