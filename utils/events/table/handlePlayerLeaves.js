// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tableDb,
	tablePlayerDb,
	userDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
}	= constants;

const player_left = 'player_left';

module.exports = async (io, socket, callback) => {
	try {
		const {
			getNextPlayer,
			handleTablePlayerPayloads,
			handleUpdateLobbyTables,
			isNonEmptyObject,
		} = require('../../index.js');
		const leftPlayerUserId = socket.user_id;
		let tablePlayer;
		try {
			tablePlayer = await tablePlayerDb.getTablePlayerByUserId(leftPlayerUserId);
		} catch (e) { return; }
		const {
			action,
			cards,
			end_action,
			table_chips,
			table_id,
		} = tablePlayer;
		const { players } = await tableDb.getTable(table_id);
		const { position } = players.find(p => p && p.user_id === leftPlayerUserId);
		let user_chips;
		// if the player was the only one at the table
		if (players.filter(p => p).length === 1) {
			// update their user chips with their table chips and delete the table
			user_chips = (await userDb.addToUserChips(leftPlayerUserId, table_chips))[0];
			await tableDb.deleteTable(table_id);
			if (callback) callback(user_chips);
			return handleUpdateLobbyTables(io);
		// else if action is not on player AND player has no cards (from folding or not entering hand)
		} else if (!action && (!cards.length || !isNonEmptyObject(cards[0]))) {
			// update their total user chips with the chips they had at the table
			user_chips = (await userDb.addToUserChips(leftPlayerUserId, table_chips))[0];
			// if this user was end_action, assign end_action to the next player at the table
			if (end_action) {
				const { position } = await getNextPlayer(table_id, 'end_action');
				await tablePlayerDb.updateEndAction(table_id, position);
			}
			// then remove them from the table
			await tablePlayerDb.deleteTablePlayer(table_id, leftPlayerUserId);
			if (callback) callback(user_chips);
			await handleTablePlayerPayloads(io, table_id, player_left, [ position ]);
			return handleUpdateLobbyTables(io);
		}
		// else if action is on player or if player has cards(is in the hand)
		// show them as having left the table room(not removed yet)
		await tablePlayerDb.updateInTableRoom(table_id, leftPlayerUserId, false);
		if (callback) callback(user_chips);
		await handleTablePlayerPayloads(io, table_id, player_left, []);
		return handleUpdateLobbyTables(io);
	} catch (e) {
		const errMsg = 'Player Leaves Table' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
