'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export type LoginState = {
  message?: string;
  success?: boolean;
};

export async function authenticate(
  prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  console.log('--- ENTERING AUTHENTICATE ACTION v2 ---');
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
          return { message: 'Invalid credentials.', success: false };
        default:
          return { message: 'Something went wrong.', success: false };
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
    return { message: 'An unexpected error occurred. Please try again.', success: false };
  }
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
