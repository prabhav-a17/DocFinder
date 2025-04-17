// frontend/src/services/api.ts

/**
 * Uploads an image to the backend and gets the chatbot's response.
 * 
 * @param file - the image file to send
 * @returns chatbot's analysis of the image
 */
export const uploadImageToBot = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const res = await fetch('http://localhost:8001/api/upload-image/', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Upload to bot failed:", error);
      return null;
    }
  };
  