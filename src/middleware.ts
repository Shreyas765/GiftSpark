import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { 
  SecurityIncidentLevel,
  SecurityIncidentType,
  logSecurityIncident,
  analyzeSecurityThreats,
  createSecurityResponse
} from './utils/security'

// Rate limiting configuration - more lenient
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // Increased from 50 to 100 requests per window

// In-memory store for rate limiting
const rateLimit = new Map<string, number[]>()

const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY!
const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY!
const AMAZON_PARTNER_TAG = process.env.AMAZON_PARTNER_TAG!

export async function middleware(request: NextRequest) {
  // Get IP for security monitoring
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            request.headers.get('x-client-ip') ||
            'anonymous'

  // Check if IP is flagged for suspicious activity
  if (analyzeSecurityThreats(ip)) {
    await logSecurityIncident({
      timestamp: Date.now(),
      level: SecurityIncidentLevel.CRITICAL,
      type: SecurityIncidentType.SUSPICIOUS_IP,
      ip,
      details: 'IP blocked due to suspicious activity'
    })
    return createSecurityResponse('Access denied due to suspicious activity', 403)
  }

  // Only apply to amazon-products API endpoint
  if (request.nextUrl.pathname.startsWith('/api/amazon-products')) {
    // In development, allow all requests (skip all checks)
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.next();
    }

    // Force HTTPS only in production
    if (!request.url.startsWith('https')) {
      return NextResponse.redirect(
        new URL(request.url.replace('http://', 'https://')),
        { status: 301 }
      )
    }

    // 1. Authentication Check - more lenient
    const token = await getToken({ req: request })
    if (!token) {
      // Log but don't block in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Unauthenticated access attempt')
        return NextResponse.next()
      }
      
      await logSecurityIncident({
        timestamp: Date.now(),
        level: SecurityIncidentLevel.WARNING,
        type: SecurityIncidentType.UNAUTHORIZED_ACCESS,
        ip,
        details: 'Attempted access without authentication'
      })
      return createSecurityResponse('Authentication required', 401)
    }

    // 2. Role-based Access Control - more lenient
    const userRole = token.role as string
    
    // In development, allow all authenticated users
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.next()
    }
    
    // In production, allow more roles
    const allowedRoles = ['admin', 'product_manager', 'user', 'premium_user']
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      await logSecurityIncident({
        timestamp: Date.now(),
        level: SecurityIncidentLevel.WARNING,
        type: SecurityIncidentType.UNAUTHORIZED_ACCESS,
        ip,
        userId: token.sub as string,
        details: `Unauthorized role access attempt: ${userRole || 'undefined'}`
      })
      return createSecurityResponse('Insufficient permissions to access Amazon product information', 403)
    }

    // 3. Rate Limiting - more lenient
    const now = Date.now()
    const windowStart = now - RATE_LIMIT_WINDOW
    
    // Clean up old entries
    const userRequests: number[] = rateLimit.get(ip) || []
    const recentRequests: number[] = userRequests.filter((time: number): boolean => time > windowStart)
    
    if (recentRequests.length >= MAX_REQUESTS) {
      // Log but don't block in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Rate limit exceeded')
        return NextResponse.next()
      }
      
      await logSecurityIncident({
        timestamp: Date.now(),
        level: SecurityIncidentLevel.WARNING,
        type: SecurityIncidentType.RATE_LIMIT_EXCEEDED,
        ip,
        userId: token.sub as string,
        details: `Rate limit exceeded: ${recentRequests.length} requests`
      })
      return createSecurityResponse('Too many requests', 429)
    }
    
    // Add current request
    recentRequests.push(now)
    rateLimit.set(ip, recentRequests)
  }

  const response = NextResponse.next()

  // Add security headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' https://images.unsplash.com https://images-na.ssl-images-amazon.com; connect-src 'self' https://api.amazon.com;")

  return response
}

export const config = {
  matcher: '/api/amazon-products/:path*'
}
