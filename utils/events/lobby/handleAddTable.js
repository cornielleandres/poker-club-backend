// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tableDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
	lobby_room,
	update_lobby_tables,
}	= constants;

module.exports = async (socket, table, callback) => {
	try {
		const table_id = (await tableDb.addTable(table))[0];
		callback(table_id);
		const tables = await tableDb.getLobbyTables();
		return socket.to(lobby_room).emit(update_lobby_tables, tables);
	} catch (e) {
		const errMsg = 'Add Table Error: ' + e.toString();
		return socket.emit(error_message, errMsg);
	}
};
