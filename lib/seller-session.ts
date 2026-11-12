import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

import type { Exhibition } from '@/lib/types'
import { apiWriteToken } from '@/sanity/env'
import { approvedSellerExhibitionQuery } from '@/sanity/lib/queries'
import { writeClient } from '@/sanity/lib/write-client'

const SESSION_COOKIE = 'seller_session'
const SESSION_LIFETIME_SECONDS = 12 * 60 * 60

interface SellerSession {
  exhibitionId: string
  expiresAt: number
}

function getSessionSecret(): string {
  if (!apiWriteToken) {
    throw new Error('SANITY_API_WRITE_TOKEN is required to sign seller sessions.')
  }

  return apiWriteToken
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url')
}

export async function setSellerSession(exhibitionId: string): Promise<void> {
  const session: SellerSession = {
    exhibitionId,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
  }
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const value = `${payload}.${sign(payload)}`

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_LIFETIME_SECONDS,
  })
}

async function readSellerSession(): Promise<SellerSession | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value
  if (!value) return null

  const [payload, signature, extra] = value.split('.')
  if (!payload || !signature || extra !== undefined) return null

  const expected = Buffer.from(sign(payload), 'base64url')
  const received = Buffer.from(signature, 'base64url')
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as Partial<SellerSession>

    if (
      typeof session.exhibitionId !== 'string' ||
      !session.exhibitionId ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null
    }

    return {
      exhibitionId: session.exhibitionId,
      expiresAt: session.expiresAt,
    }
  } catch {
    return null
  }
}

export async function getApprovedSellerExhibition(): Promise<Exhibition | null> {
  const session = await readSellerSession()
  if (!session) return null

  return writeClient.fetch<Exhibition | null>(approvedSellerExhibitionQuery, {
    exhibitionId: session.exhibitionId,
  })
}

export async function getApprovedSellerExhibitionId(): Promise<string | null> {
  const exhibition = await getApprovedSellerExhibition()
  return exhibition?._id ?? null
}
