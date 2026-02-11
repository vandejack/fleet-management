import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const takePhoto = async () => {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.Uri,
            source: CameraSource.Prompt // Ask user: Camera or Photos
        });

        return image.webPath; // Return the path for display
    } catch (error) {
        console.error('Camera error:', error);
        return null;
    }
};
