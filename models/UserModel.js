const mongoose = require('mongoose');

const optionsSchema = new mongoose.Schema(
	{
		darkTheme: Boolean,
	},
	{
		_id: false,
	}
);

const friendsSchema = new mongoose.Schema(
	{
		id: { type: String, required: true },
		messagesCollection: { type: String, required: true },
	},
	{
		_id: false,
	}
);

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		friends: { type: [friendsSchema], default: [] },
		options: {
			type: optionsSchema,
			default: {
				darkTheme: true,
			},
		},
	},
	{
		versionKey: false,
		collection: 'users',
	}
);

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;
