import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login', // by adding signIn: '/login' into our pages option, the user will be redirected to our custom login page, rather than the NextAuth.js default page.
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {  //The authorized callback is used to verify if the request is authorized to access a page with Next.js Middleware.
        // The auth property contains the user's session, and the request property contains the incoming request.
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
        if (isOnDashboard) {
            if (isLoggedIn) return true;
            return false; // Redirect unauthenticated users to login page
        } else if (isLoggedIn) {
            return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
        },
    },
    providers: [], // The providers option is an array where you list different login options. Add providers with an empty array for now
} satisfies NextAuthConfig;