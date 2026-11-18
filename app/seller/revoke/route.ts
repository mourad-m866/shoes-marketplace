import {NextResponse, type NextRequest} from 'next/server'

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL('/seller?access=rejected', request.url),
  )
  response.cookies.delete('seller_session')
  return response
}
