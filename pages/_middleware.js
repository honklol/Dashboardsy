import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(req) {

    const session = await getToken({
        req,
        secret: process.env.SECRET_COOKIE_PASSWORD,
        secureCookie: process.env.NEXTAUTH_URL.startsWith('https://')
    })
    if (req.url.includes("/favicon.png") || req.page.name && req.page.name.includes("/favicon.png")) return NextResponse.next()
    if (req.url.includes("/api/admin") || req.page.name && req.page.name.includes("/api/admin")) return NextResponse.next()
    if (req.url.includes("/api/auth/signin") || req.page.name && req.page.name.includes("/api/auth/")) {
        if (!session) {
            return NextResponse.next()
        } else {
            return new Response("You are already logged in")
        }
    }
    if (!session) return NextResponse.redirect("/api/auth/signin")
    return NextResponse.next()
}