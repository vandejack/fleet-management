'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    console.log('[authenticate] Caught error:', error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    // Check if it's a redirect error (NEXT_REDIRECT)
    if ((error as any).message === 'NEXT_REDIRECT' || (error as any).digest?.startsWith('NEXT_REDIRECT')) {
      console.log('[authenticate] Re-throwing redirect error');
      throw error;
    }

    console.error('[authenticate] Unhandled error:', error);
    // If it's a real crash, return a message instead of blowing up the client
    // But we must be careful not to swallow redirects if the check above misses some cases.
    // For now, let's re-throw but log it first.
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
