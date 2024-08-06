import { useState, useRef } from 'react';
import { Button, Box } from '@mui/material';
import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ImageCapture({ onImageUpload }) {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const captureImage = () => {
    setCapturing(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      const imageName = `item_${Date.now()}.jpg`;
      const imageRef = ref(storage, `images/${imageName}`);
      try {
        const snapshot = await uploadBytes(imageRef, blob);
        console.log('Uploaded a blob or file!', snapshot);
        const downloadURL = await getDownloadURL(imageRef);
        console.log('File available at', downloadURL);
        onImageUpload(downloadURL);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setCapturing(false);
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <Box sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <Box sx={{ overflowY: 'auto', maxHeight: '100%' }}>
        <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '400px' }} />
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" onClick={startCamera} disabled={stream} sx={{ mr: 1 }}>Start Camera</Button>
          <Button variant="contained" onClick={captureImage} disabled={!stream || capturing} sx={{ mx: 1 }}>
            {capturing ? 'Capturing...' : 'Capture'}
          </Button>
          <Button variant="contained" onClick={stopCamera} disabled={!stream} sx={{ ml: 1 }}>Stop Camera</Button>
        </Box>
      </Box>
    </Box>
  );
}