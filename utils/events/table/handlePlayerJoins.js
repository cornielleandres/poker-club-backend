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
	update_action_chat,
}	= constants;

module.exports = async (io, socket, table_id, callback) => {
	try {
		const {
			handleGetNewHand,
			handleTablePlayerPayloads,
			handleUpdateLobbyTables,
		} = require('../../index.js');
		const { user_id } = socket;
		const prevPlayersLen = (await tablePlayerDb.getTablePlayersByTableId(table_id)).length;
		const user_chips = await tablePlayerDb.joinTable(table_id, user_id);
		callback(user_chips);
		const tablePlayers = await tablePlayerDb.getTablePlayersByTableId(table_id);
		const newPlayersLen = tablePlayers.length;
		const { position, in_table_room } = tablePlayers.find(p => p.user_id === user_id);
		// if player had previously left table room, update their status to reflect their joining it again
		if (!in_table_room) await tablePlayerDb.updateInTableRoom(table_id, user_id, true);
		await handleUpdateLobbyTables(null, socket, null);
		await handleTablePlayerPayloads(io, table_id, 'player_joined', [ position ], 1000);
		const actionChatPayload = { type: 'player_join', payload: {description: 'joined the table', user_id} };
		await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
		if (prevPlayersLen === 1 && newPlayersLen === 2) return handleGetNewHand(io, table_id);
	} catch (e) {
		const errMsg = 'Player Joins Table: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
