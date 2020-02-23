// config
const {
	constants,
}	= require('../../../config/index.js');

// models
const {
	tableDb,
}	= require('../../../data/models/index.js');

const {
	lobby_room,
}	= constants;

const update_lobby_tables = 'update_lobby_tables';

module.exports = async (io, socket, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const lobbyTables = await tableDb.getLobbyTables();
		// if an io was provided, send the lobby tables to everyone in the lobby room
		if (io) return io.in(lobby_room).emit(update_lobby_tables, lobbyTables);
		// if a callback was provided, only send the lobby tables to that specific user
		if (callback) return callback(lobbyTables);
		// else, send the lobby tables to everyone in the lobby room except the socket user
		return socket.to(lobby_room).emit(update_lobby_tables, lobbyTables);
	} catch (e) {
		return handleError('Error updating lobby tables.', e, socket, io, lobby_room);
	}
};
