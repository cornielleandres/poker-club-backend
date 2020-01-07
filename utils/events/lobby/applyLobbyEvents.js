// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	error_message,
	lobby_room,
}	= constants;

const add_table = 'add_table';
const get_allowed_table_values = 'get_allowed_table_values';

const _addAllLobbyEventListeners = socket => {
	const { handleGetAllowedTableValues, handleAddTable } = require('../../index.js');
	socket.on(add_table, (table, callback) => handleAddTable(socket, table, callback));
	socket.on(get_allowed_table_values, callback => handleGetAllowedTableValues(socket, callback));
};

const _removeAllLobbyEventListeners = socket => {
	socket.removeAllListeners(add_table);
	socket.removeAllListeners(get_allowed_table_values);
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
