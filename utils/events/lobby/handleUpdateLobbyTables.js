// config
const {
	constants,
}	= require('../../../config/index.js');

// models
const {
	tableDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
	lobby_room,
}	= constants;

const update_lobby_tables = 'update_lobby_tables';

module.exports = async (io, socket, callback) => {
	try {
		const lobbyTables = await tableDb.getLobbyTables();
		// if a callback was provided, only send the lobby tables to that specific user
		if (callback) return callback(lobbyTables);
		// if a socket was provided, send the lobby tables to everyone in the lobby room except the socket user
		if (socket) return socket.to(lobby_room).emit(update_lobby_tables, lobbyTables);
		// else, send the lobby tables to everyone in the lobby room
		return io.in(lobby_room).emit(update_lobby_tables, lobbyTables);
	} catch (e) {
		const errMsg = 'Update Lobby Tables' + e.toString();
		console.log(errMsg);
		return io.in(lobby_room).emit(error_message, errMsg);
	}
};
