'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // We use redirect: false so we can control the response
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirect: false,
    });

    // If we get here without error, it's successful
    return { success: true };
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
    // Check if it's a redirect error (NEXT_REDIRECT) - signIn might still throw it if we didn't use redirect: false
    // But since we use redirect: false, strictly speaking it shouldn't throw NEXT_REDIRECT for success.
    // However, let's keep it safe.
    if ((error as any).message === 'NEXT_REDIRECT' || (error as any).digest?.startsWith('NEXT_REDIRECT')) {
      console.log('[authenticate] Caught redirect error, treating as success');
      return { success: true };
    }

    console.error('[authenticate] Unhandled error:', error);
    return 'An unexpected error occurred. Please try again.';
  }
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
