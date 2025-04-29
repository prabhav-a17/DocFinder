import React, { useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import { fileToBase64, fileToByteStream } from '../utils/imageUtils';

const ImageUpload: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            // Get as base64 string
            const base64String = await fileToBase64(file);
            console.log('Base64:', base64String);

            // Get as bytestream
            const byteStream = await fileToByteStream(file);
            console.log('ByteStream:', byteStream);

            // Example: Send to server
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('your-api-endpoint', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Server response:', data);
        } catch (error) {
            console.error('Error processing image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
                variant="contained"
                component="label"
                disabled={isLoading}
            >
                Upload Image
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload}
                />
            </Button>
            {isLoading && <CircularProgress size={24} />}
        </Box>
    );
};

export default ImageUpload; 