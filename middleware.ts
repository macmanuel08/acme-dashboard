import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth; // initializing NextAuth.js with the authConfig object and exporting the auth property
 
export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'], // matcher option from Middleware to specify that it should run on specific paths.
};