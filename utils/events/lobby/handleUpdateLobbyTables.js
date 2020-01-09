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
	update_lobby_tables,
}	= constants;

module.exports = async io => {
	try {
		const lobbyTables = await tableDb.getLobbyTables();
		return io.in(lobby_room).emit(update_lobby_tables, lobbyTables);
	} catch (e) {
		const errMsg = 'Handle Update Lobby Tables' + e.toString();
		console.log(errMsg);
		return io.in(lobby_room).emit(error_message, errMsg);
	}
};
