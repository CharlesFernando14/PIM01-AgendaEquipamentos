import { NextResponse } from 'next/server';
import { getDeleteSessionCookieConfig } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieConfig = getDeleteSessionCookieConfig();
  response.cookies.set(cookieConfig);
  return response;
}
