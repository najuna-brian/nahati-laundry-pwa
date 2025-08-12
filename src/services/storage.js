import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const storage = getStorage();

const uploadFile = async (file) => {
    const storageRef = ref(storage, `uploads/${file.name}`);
    try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

const deleteFile = async (filePath) => {
    const fileRef = ref(storage, filePath);
    try {
        await deleteObject(fileRef);
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
};

export { uploadFile, deleteFile };