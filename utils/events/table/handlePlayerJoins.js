// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
}	= constants;

module.exports = async (io, socket, table_id, callback) => {
	try {
		const {
			handleGetNewHand,
			handleTablePlayerPayloads,
			handleUpdateLobbyTables,
		} = require('../../index.js');
		const joinedPlayerUserId = socket.user_id;
		const prevPlayersLen = (await tablePlayerDb.getTablePlayersByTableId(table_id)).length;
		const user_chips = await tablePlayerDb.joinTable(table_id, joinedPlayerUserId);
		callback(user_chips);
		const tablePlayers = await tablePlayerDb.getTablePlayersByTableId(table_id);
		const newPlayersLen = tablePlayers.length;
		const { position, in_table_room } = tablePlayers.find(p => p.user_id === joinedPlayerUserId);
		// if player had previously left table room, update their status to reflect their joining it again
		if (!in_table_room) await tablePlayerDb.updateInTableRoom(table_id, joinedPlayerUserId, true);
		await handleUpdateLobbyTables(null, socket, null);
		await handleTablePlayerPayloads(io, table_id, 'player_joined', [ position ]);
		if (prevPlayersLen === 1 && newPlayersLen === 2) return handleGetNewHand(io, table_id);
	} catch (e) {
		const errMsg = 'Player Joins Table' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
