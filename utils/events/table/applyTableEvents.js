// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	error_message,
	table_room,
}	= constants;

// const _addAllTableEventListeners = (io, socket) => {
// 	const { handlePlayerLeaves } = require('../../index.js');
// 	socket.on(player_leaves, callback => handlePlayerLeaves(io, socket, callback));
// };

// const _removeAllTableEventListeners = socket => {
// 	socket.removeAllListeners(player_leaves);
// };

module.exports = (io, socket) => {
	const { handlePlayerJoins, handlePlayerLeaves }	= require('../../index.js');
	socket.on('join_table_room', (table_id, callback) => (
		socket.join(table_room + table_id, err => {
			if (err) return socket.emit(error_message, err.toString());
			// _addAllTableEventListeners(io, socket);
			return handlePlayerJoins(io, socket, table_id, callback);
		})
	));
	socket.on('leave_table_room', (table_id, callback) => (
		socket.leave(table_room + table_id, err => {
			if (err) return socket.emit(error_message, err.toString());
			// _removeAllTableEventListeners(socket);
			return handlePlayerLeaves(io, socket, callback);
		})
	));
};
