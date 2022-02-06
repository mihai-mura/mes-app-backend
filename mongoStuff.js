const UserModel = require('./models/UserModel.js');
const MessageModel = require('./models/MessageModel.js');
const bcrypt = require('bcrypt');
const createProfilePic = require('./profilePicStuff/createProfilePic.js');

const createUser = async (email, password, fname, lname) => {
	try {
		const createdUser = await UserModel.create({
			email: email,
			password: password,
			firstName: fname,
			lastName: lname,
		});

		createProfilePic(createdUser._id, createdUser.firstName, createdUser.lastName);

		console.log('Created new user');
		return 1;
	} catch (error) {
		console.log(error.message);
		return error.code;
	}
};

const getUserData = async (id) => {
	try {
		const user = await UserModel.findById(id);
		return user;
	} catch (error) {
		console.log(error.message);
		return null;
	}
};

const updateUser = async (id, field, data) => {
	if (field === 'name') {
		await UserModel.updateOne(
			{ _id: id },
			{
				firstName: data.fname,
				lastName: data.lname,
			}
		);
		return 1;
	} else if (field === 'theme') {
		await UserModel.updateOne(
			{ _id: id },
			{
				options: {
					darkTheme: data.value,
				},
			}
		);
		return 1;
	} else if (field === 'friends') {
		const usersFriend = await UserModel.findOne({ _id: id, friends: { id: data.value } }).select({ friends: 1 });
		const friendsFriend = await UserModel.findOne({ _id: data.value, friends: { id: id } }).select({ friends: 1 });
		if (usersFriend && friendsFriend) return 2; //if users are friends already

		const commonCollection = `${id}-${data.value}`;
		await UserModel.updateOne({ _id: id }, { $push: { friends: { id: data.value, messagesCollection: commonCollection } } });
		await UserModel.updateOne({ _id: data.value }, { $push: { friends: { id: id, messagesCollection: commonCollection } } });
		return 1;
	} else if (field === 'password') {
		const password = await bcrypt.hash(data.value, 10);
		await UserModel.updateOne({ _id: id }, { password: password });
		return 1;
	} else {
		return 0;
	}
};

const getUserIfNotFriendsAlready = async (input, userId) => {
	let userData = [];
	//checks the first and last name for input with regex
	if (input.split(' ')[1]) {
		const splitInput = input.split(' ');
		userData = await UserModel.find({
			$and: [
				{
					$or: [
						{
							$and: [
								{ firstName: { $regex: splitInput[0], $options: 'i' } },
								{ lastName: { $regex: splitInput[1], $options: 'i' } },
							],
						},
						{
							$and: [
								{ firstName: { $regex: splitInput[1], $options: 'i' } },
								{ lastName: { $regex: splitInput[0], $options: 'i' } },
							],
						},
					],
				},
				{ _id: { $ne: userId } }, //checks the id so it differs from users id
				{ 'friends.id': { $ne: userId } }, //checks if users are already friends
			],
		})
			.select({ firstName: 1, lastName: 1, _id: 1 })
			.limit(30);
	} else {
		userData = await UserModel.find({
			$and: [
				{
					$or: [
						{ firstName: { $regex: input.split(' ')[0], $options: 'i' } },
						{ lastName: { $regex: input.split(' ')[0], $options: 'i' } },
					],
				},
				{ _id: { $ne: userId } }, //checks the id so it differs from users id
				{ 'friends.id': { $ne: userId } }, //checks if users are already friends
			],
		})
			.select({ firstName: 1, lastName: 1, _id: 1 })
			.limit(30);
	}

	return userData;
};

const getFriends = async (userId) => {
	//get s a list of the users friends id s
	const friendsIds = (await UserModel.findById(userId).select({ friends: 1 })).friends.map((value) => {
		return value.id;
	});
	const friends = await UserModel.find({ _id: friendsIds }).select({ password: 0, options: 0 });

	return friends.map((friend) => {
		return {
			_id: friend._id,
			email: friend.email,
			firstName: friend.firstName,
			lastName: friend.lastName,
			messagesCollection: friend.friends.filter((element) => {
				return element.id === userId;
			})[0].messagesCollection,
		};
	});
};

const getMessages = async (collection, type) => {
	if (type === 'all') {
		return await MessageModel(collection).find();
	} else {
		return await MessageModel(collection).findOne().sort({ createdAt: -1 });
	}
};

const addMessage = async (message, user, collection) => {
	const res = await MessageModel(collection).create({
		message: message,
		user: user,
	});
	return res;
};

module.exports = {
	createUser,
	getUserData,
	updateUser,
	getUserIfNotFriendsAlready,
	getFriends,
	getMessages,
	addMessage,
};
