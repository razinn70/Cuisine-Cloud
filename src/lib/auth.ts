import { cookies } from 'next/headers';
import type { User } from "firebase/auth";
import { adminAuth } from './firebase/server';

// This is a helper function to get the user from the server-side.
// It is used in server components and server actions.
// It is not meant to be used in client components.
export async function getAuthenticatedUser(): Promise<User | null> {
    const session = cookies().get('session')?.value;
    if (!session) {
        return null;
    }

    try {
        const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
        const user = await adminAuth.getUser(decodedIdToken.uid);

        return {
           uid: user.uid,
           email: user.email,
           displayName: user.displayName,
           photoURL: user.photoURL,
           emailVerified: user.emailVerified,
           isAnonymous: false,
           metadata: {
             creationTime: user.metadata.creationTime,
             lastSignInTime: user.metadata.lastSignInTime,
           },
           providerData: user.providerData,
        } as User;

    } catch (error) {
        console.error("Failed to get authenticated user:", error);
        // Session cookie is invalid or expired.
        // Force user to re-authenticate.
        return null;
    }
}
