const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const stream = require("stream");
const User = require("../models/UserModel");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
        cb(null, true);
        } else {
        cb(new Error("Only image files are allowed!"), false);
        }
    },
});

// @desc    Upload avatar to Cloudinary
// @route   POST /api/upload/avatar
// @access  Protected
const uploadAvatar = async (req, res) => {
    try {
        console.log("📤 Upload request received");

        if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image file provided",
        });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
            folder: "techswap/avatars",
            transformation: [
                { width : 200, height : 200, crop: "fill", gravity: "face" },
                { quality: "auto" },
                { format: "webp" },
            ],
            },
            (error, result) => {
            if (error) {
                console.error("❌ Cloudinary upload error:", error);
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
        });

        // Update user's avatar in database
        const userId = req.user._id;
        const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: result.secure_url },
        { new: true }
        ).select("name email avatar");

        res.json({
        success: true,
        message: "Avatar uploaded successfully",
        imageUrl: result.secure_url,
        data: {
            avatar: result.secure_url,
            user: updatedUser,
        },
        });
    } catch (error) {
        console.error("❌ Upload route error:", error);
        res.status(500).json({
        success: false,
        message: "Server error during image upload",
        });
    }
    };

    // Error handling middleware for multer
    const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File too large. Maximum size is 5MB.",
        });
        }
    } else if (error) {
        return res.status(400).json({
        success: false,
        message: error.message,
        });
    }
    next();
    };

    module.exports = {
    upload,
    uploadAvatar,
    handleMulterError,
};
