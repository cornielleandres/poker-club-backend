// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	table_room,
}	= constants;

const add_to_player_chat	= 'add_to_player_chat';
const player_calls				= 'player_calls';
const player_checks				= 'player_checks';
const player_discards			= 'player_discards';
const player_folds				= 'player_folds';
const player_raises				= 'player_raises';

const _addAllTableEventListeners = (io, socket) => {
	const {
		handleAddToPlayerChat,
		handlePlayerCalls,
		handlePlayerChecks,
		handlePlayerDiscards,
		handlePlayerFolds,
		handlePlayerRaises,
	}	= require('../../index.js');
	socket.on(add_to_player_chat, msg => handleAddToPlayerChat(io, socket, msg));
	socket.on(player_calls, () => handlePlayerCalls(io, socket));
	socket.on(player_checks, () => handlePlayerChecks(io, socket));
	socket.on(player_discards, cardIdx => handlePlayerDiscards(io, socket, cardIdx));
	socket.on(player_folds, () => handlePlayerFolds(io, socket));
	socket.on(player_raises, raise => handlePlayerRaises(io, socket, raise));
};

const _removeAllTableEventListeners = socket => {
	socket.removeAllListeners(add_to_player_chat);
	socket.removeAllListeners(player_calls);
	socket.removeAllListeners(player_checks);
	socket.removeAllListeners(player_discards);
	socket.removeAllListeners(player_folds);
	socket.removeAllListeners(player_raises);
};

module.exports = (io, socket) => {
	const { handleError, handlePlayerJoins, handlePlayerLeaves }	= require('../../index.js');
	socket.on('join_table_room', (table_id, callback) => (
		socket.join(table_room + table_id, err => {
			if (err) return handleError(`Error joining table #${ table_id }.`, err, socket);
			_addAllTableEventListeners(io, socket);
			return handlePlayerJoins(io, socket, table_id, callback);
		})
	));
	socket.on('leave_table_room', (table_id, callback) => (
		socket.leave(table_room + table_id, err => {
			if (err) return handleError(`Error leaving table #${ table_id }.`, err, socket);
			_removeAllTableEventListeners(socket);
			return handlePlayerLeaves(io, socket, callback);
		})
	));
};
