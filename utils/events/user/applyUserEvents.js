// config
const {
	constants,
	variables,
}	= require('../../../config/index.js');

// databases
const {
	tablePlayerDb,
	userDb,
}	= require('../../../data/models/index.js');

const {
	bigBlinds,
	error_message,
	gameTypes,
	maxPlayers,
	tableTypes,
	usersKey,
}	= constants;

const {
	nodeEnv,
}	= variables;

const allowedTableValues = { bigBlinds, gameTypes, maxPlayers, tableTypes };
const disconnectMessage = 'You have been disconnected because you logged in somewhere else.';
const logOutMessage = 'You have been logged out. Please wait a minute and try logging in again. If that does not work, contact the administrator.';
const update_user_count = 'update_user_count';

const _applyUserEvents = socket => {
	const {
		handleClaimDailyChips,
		handleGetDefaultAvatars,
		handleGetMainColors,
		handleToggleDarkMode,
		handleUpdateAvatar,
		handleUpdateDefaultAvatar,
		handleUpdateMainColor,
		handleUpdatePicture,
		handleUpdateUser,
	}	= require('../../index.js');
	socket.on('claim_daily_chips', callback => handleClaimDailyChips(socket, callback));
	socket.on('get_default_avatars', callback => handleGetDefaultAvatars(socket, callback));
	socket.on('get_main_colors', callback => handleGetMainColors(socket, callback));
	socket.on('toggle_dark_mode', callback => handleToggleDarkMode(socket, callback));
	socket.on('update_avatar', (avatar, callback) => handleUpdateAvatar(socket, avatar, callback));
	socket.on('update_default_avatar', (id, callback) => handleUpdateDefaultAvatar(socket, id, callback));
	socket.on('update_main_color', (id, callback) => handleUpdateMainColor(socket, id, callback));
	socket.on('update_picture', (picture, callback) => handleUpdatePicture(socket, picture, callback));
	socket.on('update_user', (user, callback) => handleUpdateUser(socket, user, callback));
};

const authenticate = async (io, socket, payload, callback) => {
	const { handleError, redisClient }	= require('../../index.js');
	const socketId = socket.id;
	try {
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
		const errMsgDescription = 'Error authenticating.';
		await handleError(errMsgDescription, e, connectedSocket);
		if (connectedSocket) connectedSocket.disconnect(true);
		// if in production, emit the error description, else emit the entire error
		const err = nodeEnv === 'production' ? errMsgDescription : errMsgDescription + ' ' + e.toString();
		return callback({ message: err });
	}
};

const disconnect = async (io, socket, disconnectMessage) => {
	const { handleError, handlePlayerLeaves, redisClient }	= require('../../index.js');
	try {
		const { user_id } = socket;
		if (user_id) {
			await redisClient.delAsync(usersKey + user_id);
			await handlePlayerLeaves(io, socket);
			delete socket.user_id;
			socket.auth = false;
			socket.emit(error_message, disconnectMessage || 'You have been disconnected.');
			socket.disconnect(true);
			io.emit(update_user_count, Object.keys(io.sockets.sockets).length);
		}
	} catch (e) {
		return handleError('User disconnect error.', e);
	}
};

const postAuthenticate = async (io, socket) => {
	const { applyLobbyEvents, applyTableEvents, handleError, redisClient }	= require('../../index.js');
	try {
		const { user_id } = socket;
		const user = await userDb.getUserById(user_id);
		const tablePlayer = await tablePlayerDb.getTableIdByUserId(user_id);
		const userConnectPayload = { user };
		if (tablePlayer) userConnectPayload.table_id = tablePlayer.table_id;
		socket.emit('user_connect', userConnectPayload, allowedTableValues);
		socket.conn.on('packet', async packet => {
			if (socket.auth && packet.type === 'ping') {
				try {
					// XX states that it will only set they key if it already exists.
					// EX 30 will auto-expire the lock after 30 seconds.
					await redisClient.setAsync(usersKey + user_id, socket.id, 'XX', 'EX', 30);
				} catch (e) {
					return handleError('Error pinging server.', e, socket);
				}
			}
		});
		_applyUserEvents(socket);
		applyLobbyEvents(socket);
		applyTableEvents(io, socket);
		io.emit(update_user_count, Object.keys(io.sockets.sockets).length);
		socket.on('error', err => socket.emit(error_message, err.toString())); // socket.io error
	} catch (e) {
		await handleError('Post authentication error.', e, socket);
		return socket.disconnect(true);
	}
};

module.exports = {
	authenticate,
	disconnect,
	postAuthenticate,
};
