import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    sub: string;
    exp: number;
}

const publicRoutes = ['/login', '/public/payment'];

const guestOnlyRoutes = ['/login'];
const REDIRECT_WHEN_NOT_AUTHENTICATED = "/login";

function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch {
        return true;
    }
}

export default function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);
    const accessToken = request.cookies.get("access_token")?.value;

    const isAuthenticated = accessToken && !isTokenExpired(accessToken);

    if (!isAuthenticated && !isPublicRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED;
        return NextResponse.redirect(redirectUrl);
    }

    const isGuestOnlyRoute = guestOnlyRoutes.includes(path);

    if (isAuthenticated && isGuestOnlyRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard";
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};