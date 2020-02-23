// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	lobby_room,
}	= constants;

const add_table = 'add_table';

const _addAllLobbyEventListeners = socket => {
	const { handleAddTable } = require('../../index.js');
	socket.on(add_table, (table, callback) => handleAddTable(socket, table, callback));
};

const _removeAllLobbyEventListeners = socket => {
	socket.removeAllListeners(add_table);
};

module.exports = socket => {
	const { handleError, handleGetLobbyTables } = require('../../index.js');
	socket.on('join_lobby_room', callback => (
		socket.join(lobby_room, err => {
			if (err) return handleError('Error joining lobby.', err, socket);
			_addAllLobbyEventListeners(socket);
			return handleGetLobbyTables(socket, callback);
		})
	));
	socket.on('leave_lobby_room', callback => (
		socket.leave(lobby_room, err => {
			if (err) return handleError('Error leaving lobby.', err, socket);
			_removeAllLobbyEventListeners(socket);
			return callback();
		})
	));
};
