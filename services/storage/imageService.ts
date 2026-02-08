import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../lib/firebase';

/**
 * Uploads an image file to Firebase Storage and returns the download URL
 * @param uri The local URI of the image (from picker or camera)
 * @param path The path in storage (e.g., 'profile_pics/uid.jpg')
 */
export const uploadImage = async (uri: string, path: string) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};
