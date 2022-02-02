import { NextResponse } from "next/server"
import config from '../../../config.json'

export async function middleware(req) {
    if (!config.adminapi.enabled) {
        return new Response('{ "message": "403 Forbidden (Disabled)", "error": true }')
    }
    if (!config.adminapi.apikey || config.adminapi.apikey.length < 32) {
        return new Response('{ "message": "403 Forbidden (Invalid Key set on server)", "error": true }')
    }
    return NextResponse.next()
}