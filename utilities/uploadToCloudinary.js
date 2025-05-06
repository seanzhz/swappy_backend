const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary error:", error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

module.exports = uploadToCloudinary;