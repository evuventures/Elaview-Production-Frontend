// backend/src/routes/upload.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const uploadType = req.body.type || 'image';
    const allowedMimeTypes = allowedTypes[uploadType] || allowedTypes.image;

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types for ${uploadType}: ${allowedMimeTypes.join(', ')}`));
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'property-advertising',
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// POST /api/upload - Upload single file
router.post('/', syncUser, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { type = 'image' } = req.body;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      public_id: `${req.user.id}_${Date.now()}`,
      resource_type: type === 'video' ? 'video' : 'auto'
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        type: type
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', syncUser, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const { type = 'image' } = req.body;

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map((file, index) => 
      uploadToCloudinary(file.buffer, {
        public_id: `${req.user.id}_${Date.now()}_${index}`,
        resource_type: type === 'video' ? 'video' : 'auto'
      })
    );

    const results = await Promise.all(uploadPromises);

    const uploadedFiles = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      type: type
    }));

    res.json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} files uploaded successfully`
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/upload/:publicId - Delete file from Cloudinary
router.delete('/:publicId', syncUser, async (req, res, next) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found or already deleted'
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/upload/signed-url - Get signed URL for direct upload (optional)
router.get('/signed-url', syncUser, async (req, res, next) => {
  try {
    const { type = 'image' } = req.query;
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder: 'property-advertising',
      public_id: `${req.user.id}_${timestamp}`,
      resource_type: type === 'video' ? 'video' : 'auto'
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        ...params
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;