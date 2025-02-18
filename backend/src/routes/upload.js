import express from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary'; // Assume Cloudinary setup here

const router = express.Router();

// Set up Multer to store audio files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle audio file upload
router.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    const { buffer, originalname } = req.file;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream({
      resource_type: 'auto',
      public_id: `voice_messages/${Date.now()}-${originalname}`,
    }, (error, result) => {
      if (error) {
        return res.status(500).json({ message: 'Error uploading audio file', error });
      }
      res.json({ url: result.secure_url }); // Send back the URL of the uploaded audio
    });

    // Pipe buffer to Cloudinary
    buffer.pipe(result);
  } catch (error) {
    res.status(500).json({ message: 'Error processing audio file', error });
  }
});

export default router;
