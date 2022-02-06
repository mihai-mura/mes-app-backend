const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getFriends, getUserData, getUserIfNotFriendsAlready, updateUser } = require('../mongoStuff.js');
const UserModel = require('../models/UserModel.js');
const { verifyToken } = require('../middleware.js');
const updateProfilePic = require('../profilePicStuff/updateProfilePic.js');

const router = express.Router();

router.post('/register', async (req, res) => {
	const { email, password: plainPassword, fname, lname } = req.body;
	const password = await bcrypt.hash(plainPassword, 10);
	const response = await createUser(email, password, fname, lname);
	if (response === 1) {
		res.sendStatus(201);
	} else if (response === 11000) {
		//error code for duplicate index
		res.sendStatus(409);
	}
});

router.post('/login', async (req, res) => {
	console.log(req.body);
	const { email, password } = req.body;
	const user = await UserModel.findOne({ email: email });
	if (user) {
		if (await bcrypt.compare(password, user.password)) {
			const token = jwt.sign(
				{
					_id: user._id,
				},
				process.env.JWT_SECRET
			);
			res.send(token);
		} else {
			res.sendStatus(403);
		}
	} else {
		res.sendStatus(404);
	}
});

router.post('/name', verifyToken, async (req, res) => {
	const userData = await getUserIfNotFriendsAlready(req.body.input, req.userId);
	res.json(userData);
});

router.get('/', verifyToken, async (req, res) => {
	const user = await getUserData(req.userId);
	if (user) {
		res.json({
			_id: user._id,
			email: user.email,
			fname: user.firstName,
			lname: user.lastName,
			darkTheme: user.options.darkTheme,
		});
	} else {
		res.sendStatus(500);
	}
});

router.get('/profilePic/:id', (req, res) => {
	res.sendFile(`${process.env.PROFILE_PIC_PATH}/${req.params.id}.png`);
});

router.get('/friends', verifyToken, async (req, res) => {
	try {
		const friends = await getFriends(req.userId);
		res.json(friends);
	} catch (error) {
		console.log(error.message);
		res.sendStatus(500);
	}
});

//update profile pic
router.put('/profilePic', verifyToken, updateProfilePic.single('profilePic'), (req, res) => {
	res.sendStatus(200);
});

router.put('/:field', verifyToken, async (req, res) => {
	const response = await updateUser(req.userId, req.params.field, req.body);
	if (response === 1) {
		res.status(200).send();
	} else if (response === 2) {
		res.sendStatus(409);
	} else {
		res.sendStatus(404);
	}
});

module.exports = router;
