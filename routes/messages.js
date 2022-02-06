const express = require('express');
const { verifyToken } = require('../middleware.js');
const MessageModel = require('../models/MessageModel.js');
const { addMessage, getMessages } = require('../mongoStuff.js');

const router = express.Router();

//get all messages from collection
router.get('/all/:collection', verifyToken, async (req, res) => {
	const collection = req.params.collection;
	if (collection.length === 49 && collection.includes('-') && collection.includes(req.userId)) {
		const messages = await getMessages(collection, 'all');
		res.json(messages);
	} else {
		res.sendStatus(401);
	}
});

router.get('/last/:collection', verifyToken, async (req, res) => {
	const collection = req.params.collection;
	if (collection.length === 49 && collection.includes('-') && collection.includes(req.userId)) {
		const lastMessage = await getMessages(collection, 'last');
		res.json(lastMessage);
	} else {
		res.sendStatus(401);
	}
});

module.exports = router;
