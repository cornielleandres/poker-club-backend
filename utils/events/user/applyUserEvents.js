// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
	usersKey,
}	= constants;

const disconnectMessage = 'You have been disconnected because you logged in somewhere else.';
const logOutMessage = 'You have been logged out. Please wait a minute and try logging in again. If that does not work, contact the administrator.';

const authenticate = async (io, socket, payload, callback) => {
	const socketId = socket.id;
	try {
		const { redisClient }	= require('../../index.js');
		const user_id = await userDb.getOrAddUser(payload);
		const redisClientKey = usersKey + user_id;
		// NX will only set the key if it does not already exist.
		// If it does, the command returns null.
		// EX 30 will auto-expire the lock after 30 seconds.
		let canConnect = await redisClient.setAsync(redisClientKey, socketId, 'NX', 'EX', 30);
		if (!canConnect) {
			const connectedSocketId = await redisClient.getAsync(redisClientKey);
			const connectedSocket = io.sockets.connected[ connectedSocketId ];
			if (connectedSocket) await disconnect(io, connectedSocket, disconnectMessage);
			else if (connectedSocketId) await redisClient.delAsync(redisClientKey);
			canConnect = await redisClient.setAsync(redisClientKey, socketId, 'NX', 'EX', 30);
			if (!canConnect) return callback({ message: logOutMessage });
		}
		socket.user_id = user_id;
		return callback(null, true);
	} catch (e) {
		const connectedSocket = io.sockets.connected[socketId];
		if (connectedSocket) connectedSocket.disconnect(true);
		return callback(e);
	}
};

const disconnect = async (io, socket, disconnectMessage) => {
	try {
		const { redisClient }	= require('../../index.js');
		const { user_id } = socket;
		if (user_id) {
			await redisClient.delAsync(usersKey + user_id);
			delete socket.user_id;
			socket.auth = false;
			socket.emit(error_message, disconnectMessage || 'You have been disconnected.');
			socket.disconnect(true);
		}
	} catch (e) {
		return console.log('User disconnect error:', e);
	}
};

const postAuthenticate = async (io, socket) => {
	try {
		const { redisClient }	= require('../../index.js');
		const { user_id } = socket;
		let user;
		try {
			user = await userDb.getUserById(user_id);
		} catch (e) {
			// if an error occurred while getting user by id, send error and disconnect player
			const errMsg = 'Post Authenticate Error: ' + e.toString();
			socket.emit(error_message, errMsg);
			return socket.disconnect(true);
		}
		socket.emit('user_connect', user);
		socket.conn.on('packet', async packet => {
			if (socket.auth && packet.type === 'ping') {
				try {
					// XX states that it will only set they key if it already exists.
					// EX 30 will auto-expire the lock after 30 seconds.
					await redisClient.setAsync(usersKey + user_id, socket.id, 'XX', 'EX', 30);
				} catch (e) {
					const errMsg = 'Packet Error: ' + e.toString();
					return socket.emit(error_message, errMsg);
				}
			}
		});
		socket.on('error', err => socket.emit(error_message, err.toString())); // socket.io error
	} catch (e) {
		return console.log('User postAuthenticate error:', e);
	}
};

module.exports = {
	authenticate,
	disconnect,
	postAuthenticate,
};
