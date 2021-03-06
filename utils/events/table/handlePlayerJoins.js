// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	joiningTableError,
	player_joined,
	update_action_chat,
}	= constants;

module.exports = async (io, socket, table_id, callback) => {
	const {
		handleError,
		handleGetNewHand,
		handleTablePlayerPayloads,
		handleUpdateLobbyTables,
	} = require('../../index.js');
	try {
		const { user_id } = socket;
		const prevPlayersLen = (await tablePlayerDb.getTablePlayersByTableId(table_id)).length;
		const user_chips = await tablePlayerDb.joinTable(table_id, user_id);
		callback(user_chips);
		const tablePlayers = await tablePlayerDb.getTablePlayersByTableId(table_id);
		const newPlayersLen = tablePlayers.length;
		const tablePlayer = tablePlayers.find(p => p.user_id === user_id);
		if (!tablePlayer) throw new Error('Table player not found.');
		const { position } = tablePlayer;
		await tablePlayerDb.updateInTableRoom(table_id, user_id, true);
		await handleUpdateLobbyTables(null, socket);
		await handleTablePlayerPayloads(io, table_id, player_joined, [ position ]);
		const actionChatPayload = {
			type: 'player_join',
			payload: { description: 'joined the table', user_ids: [ user_id ] },
		};
		await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
		if (prevPlayersLen === 1 && newPlayersLen === 2) return handleGetNewHand(io, table_id);
	} catch (e) {
		return handleError(joiningTableError, e, socket);
	}
};
