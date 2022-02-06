const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
	if (!req.headers.authorization) return res.sendStatus(401);
	const token = req.headers.authorization.split(' ')[1];

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = user._id;
		next();
	} catch (error) {
		console.log(error.message);
		return res.sendStatus(401);
	}
};

module.exports = {
	verifyToken,
};
