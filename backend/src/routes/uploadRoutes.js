const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Configure Cloudinary (make sure these env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Real Cloudinary upload
router.post('/avatar', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log("📤 Upload request received");
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'techswap/avatars',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { format: 'webp' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log("✅ Image uploaded to Cloudinary:", result.secure_url);
            resolve(result);
          }
        }
      );

      // Create a buffer stream from the file buffer
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(uploadStream);
    })
    .then(result => {
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: result.secure_url
      });
    })
    .catch(error => {
      console.error('❌ Upload processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading image to Cloudinary'
      });
    });

  } catch (error) {
    console.error('❌ Upload route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

module.exports = router;