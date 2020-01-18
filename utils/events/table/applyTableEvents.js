// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	error_message,
	table_room,
}	= constants;

const add_to_player_chat	= 'add_to_player_chat';
const player_calls				= 'player_calls';
const player_checks				= 'player_checks';
const player_folds				= 'player_folds';
const player_raises				= 'player_raises';

const _addAllTableEventListeners = (io, socket) => {
	const {
		handleAddToPlayerChat,
		handlePlayerCalls,
		handlePlayerChecks,
		handlePlayerFolds,
		handlePlayerRaises,
	}	= require('../../index.js');
	socket.on(add_to_player_chat, (msg, callback) => handleAddToPlayerChat(io, socket, msg, callback));
	socket.on(player_calls, callback => handlePlayerCalls(io, socket, callback));
	socket.on(player_checks, callback => handlePlayerChecks(io, socket, callback));
	socket.on(player_folds, callback => handlePlayerFolds(io, socket, callback));
	socket.on(player_raises, (raise, callback) => handlePlayerRaises(io, socket, raise, callback));
};

const _removeAllTableEventListeners = socket => {
	socket.removeAllListeners(add_to_player_chat);
	socket.removeAllListeners(player_calls);
	socket.removeAllListeners(player_checks);
	socket.removeAllListeners(player_folds);
	socket.removeAllListeners(player_raises);
};

module.exports = (io, socket) => {
	const { handlePlayerJoins, handlePlayerLeaves }	= require('../../index.js');
	socket.on('join_table_room', (table_id, callback) => (
		socket.join(table_room + table_id, err => {
			if (err) return socket.emit(error_message, err.toString());
			_addAllTableEventListeners(io, socket);
			return handlePlayerJoins(io, socket, table_id, callback);
		})
	));
	socket.on('leave_table_room', (table_id, callback) => (
		socket.leave(table_room + table_id, err => {
			if (err) return socket.emit(error_message, err.toString());
			_removeAllTableEventListeners(socket);
			return handlePlayerLeaves(io, socket, callback);
		})
	));
};
