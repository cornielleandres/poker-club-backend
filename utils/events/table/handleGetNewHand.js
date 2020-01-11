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
	table_room,
}	= constants;

const new_hand = 'new_hand';

module.exports = async (io, table_id) => {
	const { handleGetNewCards, handleRemovePlayers, handleTablePlayerPayloads } = require('../../index.js');
	try {
		// remove any players that have left the table room or have no table chips left
		await handleRemovePlayers(io, table_id);
		const tablePlayers = await tablePlayerDb.getTablePlayersByTableId(table_id);
		// if there are no more players left at the table after player removals, do nothing further
		if (!tablePlayers || tablePlayers.length === 0) return;
		// if there is only 1 player left at the table, do not get a new game,
		// instead, reset the table and wait for another player to join
		if (tablePlayers.length === 1) {
			await tableDb.resetTable(table_id);
			// reset action, dealer_btn, and end_action; and put this sole player in position 0
			// so when someone else joins, they get to start off OTB by default
			await tablePlayerDb.resetTablePlayer(table_id, tablePlayers[0].user_id);
			return handleTablePlayerPayloads(io, table_id, new_hand);
		}
		await tableDb.updateTableForNewHand(table_id);
		await tablePlayerDb.updateTablePlayersForNewHand(table_id);
		await handleTablePlayerPayloads(io, table_id, new_hand);
		return handleGetNewCards(io, table_id);
	} catch (e) {
		const errMsg = 'Get New Hand' + e.toString();
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
