const multer = require('multer');

const storage = multer.memoryStorage(); // 👈 很重要
const upload = multer({ storage });

module.exports = upload;