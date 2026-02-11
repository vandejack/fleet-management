import { NativeBiometric } from 'capacitor-native-biometric';

export const checkBiometricAvailability = async () => {
    try {
        const result = await NativeBiometric.isAvailable();
        return result.isAvailable;
    } catch (error) {
        console.error('Biometric availability check failed:', error);
        return false;
    }
};

export const authenticateWithBiometrics = async (reason: string = 'Authenticate to access your fleet') => {
    try {
        await NativeBiometric.verifyIdentity({
            reason: reason,
            title: 'Biometric Login',
            subtitle: 'Scan your fingerprint or face to continue',
            description: 'This provides a more secure and faster access to your account.',
        });
        return true;
    } catch (error) {
        console.error('Biometric authentication failed:', error);
        return false;
    }
};
