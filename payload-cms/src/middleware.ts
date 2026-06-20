// Middleware disabled — Payload CMS handles auth internally
import { NextResponse } from "next/server";
export function middleware() {
  return NextResponse.next();
}
export const config = { matcher: [] };
