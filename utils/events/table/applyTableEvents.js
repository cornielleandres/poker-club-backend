// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	error_message,
	table_room,
}	= constants;

// event names
const player_joins = 'player_joins';

const _addAllTableEventListeners = (io, socket) => {
	const { handlePlayerJoins } = require('../../index.js');
	socket.on(player_joins, (table_id, callback) => handlePlayerJoins(io, socket, table_id, callback));
};

const _removeAllTableEventListeners = socket => {
	socket.removeAllListeners(player_joins);
};

module.exports = (io, socket) => {
	socket.on('join_table_room', (table_id, callback) => (
		socket.join(table_room + table_id, err => {
			if (err) return socket.emit(error_message, err.toString());
			_addAllTableEventListeners(io, socket);
			return callback();
		})
	));
	socket.on('leave_table_room', (table_id, callback) => (
		socket.leave(table_room + table_id, err => {
			if (err) return socket.emit(error_message, err.toString());
			_removeAllTableEventListeners(socket);
			return callback();
		})
	));
};
