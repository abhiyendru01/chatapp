import express from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary';  // Assuming cloudinary is configured here

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Handle file upload
router.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    const { buffer, originalname } = req.file;

    const result = await cloudinary.uploader.upload_stream({
      resource_type: 'auto',
      public_id: `voice_messages/${Date.now()}-${originalname}`,
    }, (error, result) => {
      if (error) {
        return res.status(500).json({ message: 'Error uploading audio', error });
      }
      res.json({ url: result.secure_url });
    });

    buffer.pipe(result); // Pipe the buffer to cloudinary for upload
  } catch (error) {
    res.status(500).json({ message: 'Error uploading audio', error });
  }
});

export default router;
