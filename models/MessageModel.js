const mongoose = require('mongoose');

const MessageModel = (collection) => {
	const messageSchema = new mongoose.Schema(
		{
			message: { type: String, required: true },
			user: { type: String, required: true },
		},
		{
			versionKey: false,
			collection: collection,
			timestamps: { createdAt: true, updatedAt: false },
		}
	);

	return mongoose.models[collection] || mongoose.model(collection, messageSchema);
};

module.exports = MessageModel;
