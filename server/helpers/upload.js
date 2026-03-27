import multer from 'multer';
import streamifier from 'streamifier';


// Set up Multer for handling file uploads (in-memory storage is simple for relaying to Cloudinary)
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Cloudinary Upload Helper
const streamUpload = (reqFileBuffer, publicId) => {
    return new Promise((resolve, reject) => {
        console.log("PUBLIC ID: ", publicId)
        const stream = cloudinary.uploader.upload_stream({
            resource_type: 'image',
            folder: 'iligancitystores_products',
            public_id: publicId,
            overwrite: true,
        },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        )

        streamifier.createReadStream(reqFileBuffer).pipe(stream);
    });
};

export { upload, streamUpload }
