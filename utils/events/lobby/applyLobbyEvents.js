// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	error_message,
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
	const { handleGetLobbyTables } = require('../../index.js');
	socket.on('join_lobby_room', callback => (
		socket.join(lobby_room, err => {
			if (err) return socket.emit(error_message, err.toString());
			_addAllLobbyEventListeners(socket);
			return handleGetLobbyTables(socket, callback);
		})
	));
	socket.on('leave_lobby_room', callback => (
		socket.leave(lobby_room, err => {
			if (err) return socket.emit(error_message, err.toString());
			_removeAllLobbyEventListeners(socket);
			return callback();
		})
	));
};
