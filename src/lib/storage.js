import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a file to Firebase Storage
 * @param {File} file - The file object to upload
 * @param {string} path - The path in storage (e.g., 'logos/rootId.png')
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFile = async (file, path) => {
  if (!file) return null;
  
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
