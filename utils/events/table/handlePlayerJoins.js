// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tableDb,
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
	lobby_room,
	update_lobby_tables,
}	= constants;

module.exports = async (io, socket, table_id, callback) => {
	try {
		const joinedPlayerUserId = socket.user_id;
		const { handleTablePlayerPayloads } = require('../../index.js');
		const user_chips = await tablePlayerDb.joinTable(table_id, joinedPlayerUserId);
		callback(user_chips);
		const tables = await tableDb.getLobbyTables();
		socket.to(lobby_room).emit(update_lobby_tables, tables);
		const table = await tableDb.getTable(table_id);
		const { players } = table;
		const player = players.find(p => p && p.user_id === joinedPlayerUserId);
		const { position, in_table_room } = player;
		// if player had previously left table room, update their status to reflect their joining it again
		if (!in_table_room) await tablePlayerDb.updateInTableRoom(table_id, joinedPlayerUserId, true);
		player.in_table_room = true;
		return handleTablePlayerPayloads(io, table, 'player_joined', position);
	} catch (e) {
		const errMsg = 'Player Joins Table' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
