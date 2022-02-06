const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const userRouter = require('./routes/users.js');
const messageRouter = require('./routes/messages.js');
const { addMessage } = require('./mongoStuff.js');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
	cors: { origin: '*' },
});

mongoose.connect(process.env.MONGO_URI, (error) => {
	if (error) {
		console.log(error.message);
	} else {
		console.log('Connected to database');
	}
});

httpServer.listen(process.env.HTTP_PORT, () => console.log(`Server listening on port ${process.env.HTTP_PORT}`));

//! add admin panel auth
instrument(io, {
	auth: false,
});

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/users', userRouter);
app.use('/messages', messageRouter);

//* Socket.io stuff
io.on('connection', (socket) => {
	console.log(`socket connected with id ${socket.id}`);

	socket.on('userLogin', (id) => {
		socket.join(id);
	});
	socket.on('userLogout', (id) => {
		socket.leave(id);
	});

	socket.on('message', async (data) => {
		const { from, to, collection, message } = data;
		try {
			const res = await addMessage(message, from, collection);
			socket.to(to).emit('message', res);
			socket.to(to).emit('last-message', res);
		} catch (error) {
			console.log(error.message);
		}
	});
});
