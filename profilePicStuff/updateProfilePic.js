const multer = require('multer');

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, process.env.PROFILE_PIC_PATH);
	},
	filename: (req, file, callback) => {
		callback(null, `${req.userId}.png`);
	},
});

const updateProfilePic = multer({
	storage: storage,
	limits: {
		fileSize: 1000000,
	},
});

module.exports = updateProfilePic;
