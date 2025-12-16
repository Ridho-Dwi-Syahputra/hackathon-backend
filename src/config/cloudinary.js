// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Cloudinary Configuration
 * Setup Cloudinary dengan credentials dari environment variables
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Force HTTPS URLs
});

/**
 * Multer configuration untuk temporary storage
 * Upload sementara ke disk, lalu upload ke Cloudinary
 */
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../temp-uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
    }
});

/**
 * Multer Upload untuk Profile Images
 * Middleware untuk handle upload file
 */
const uploadProfileImage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Max 5MB
    },
    fileFilter: (req, file, cb) => {
        // Validate file type by mimetype and extension
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetypeValid = allowedMimeTypes.includes(file.mimetype);
        const extensionValid = allowedExtensions.includes(ext);
        
        // Accept if either mimetype or extension is valid (untuk compatibility dengan Android)
        if (mimetypeValid || extensionValid) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
        }
    }
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the temporary file
 * @param {string} userId - User ID for naming
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, userId) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'sako/profile-images',
            public_id: `user-${userId}-${Date.now()}`,
            transformation: [
                {
                    width: 500,
                    height: 500,
                    crop: 'fill',
                    gravity: 'face',
                    quality: 60,  // Quality 60% untuk compression
                    fetch_format: 'auto',  // Auto convert ke WebP
                    flags: 'lossy'  // Lossy compression di dalam transformation
                }
            ],
            resource_type: 'image'
        });

        // Delete temporary file after successful upload
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error('Error deleting temp file:', unlinkError);
        }

        return result;
    } catch (error) {
        // Delete temporary file on error
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error('Error deleting temp file:', unlinkError);
        }
        throw error;
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise} Result of deletion
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null if not a Cloudinary URL
 */
const extractPublicId = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    // Check if it's a Cloudinary URL
    if (!url.includes('cloudinary.com')) return null;
    
    try {
        // Extract path after /upload/
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return null;
        
        // Get path after /upload/ and any transformations
        let path = url.substring(uploadIndex + 8);
        
        // Remove version if exists (v1234567890/)
        path = path.replace(/^v\d+\//, '');
        
        // Remove file extension
        const lastDot = path.lastIndexOf('.');
        if (lastDot !== -1) {
            path = path.substring(0, lastDot);
        }
        
        return path;
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
};

module.exports = {
    cloudinary,
    uploadProfileImage,
    uploadToCloudinary,
    deleteImage,
    extractPublicId
};
