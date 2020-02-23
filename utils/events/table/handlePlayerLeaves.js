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
	player_removal,
	update_action_chat,
}	= constants;

const player_left = 'player_left';

module.exports = async (io, socket, callback) => {
	const {
		getNextPlayer,
		handleError,
		handleTablePlayerPayloads,
		handleUpdateLobbyTables,
		isNonEmptyObject,
	} = require('../../index.js');
	try {
		const { user_id } = socket;
		let user_chips;
		try {
			user_chips = await userDb.getUserChips(user_id);
		} catch (e) {
			// do nothing.
			// no table player will be found and no callback will be provided so it will be caught below.
		}
		let tablePlayer;
		try {
			tablePlayer = await tablePlayerDb.getTablePlayerByUserId(user_id);
		} catch (e) { // if no table player was found, just update their user chips
			if (callback) return callback(user_chips);
			return;
		}
		const {
			action,
			cards,
			end_action,
			table_chips,
			table_id,
		} = tablePlayer;
		const { players } = await tableDb.getTable(table_id);
		const player = players.find(p => p && p.user_id === user_id);
		if (!player) throw new Error(`Cannot find player that left with ID ${ user_id }.`);
		const { name, position } = player;
		const actionChatPayload = {
			type: player_removal,
			payload: { description: 'left the table', playerNames: [ name ] },
		};
		// if the player was the only one at the table
		if (players.filter(p => p).length === 1) {
			// update their user chips with their table chips
			user_chips = (await userDb.addToUserChips(user_id, table_chips))[0];
			if (callback) callback(user_chips);
			await tableDb.deleteTable(table_id); // delete the table
			return handleUpdateLobbyTables(io, socket); // update the lobby tables to reflect deleted table
		// else if action is not on player AND player has no cards (from folding or not entering hand)
		} else if (!action && (!cards.length || !isNonEmptyObject(cards[0]))) {
			// update their total user chips with the chips they had at the table
			user_chips = (await userDb.addToUserChips(user_id, table_chips))[0];
			// if this user was end_action, assign end_action to the next player at the table
			if (end_action) {
				const { position } = await getNextPlayer(table_id, 'end_action');
				await tablePlayerDb.updateEndAction(table_id, position);
			}
			// then remove them from the table
			await tablePlayerDb.deleteTablePlayer(table_id, user_id);
			if (callback) callback(user_chips);
			await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
			await handleTablePlayerPayloads(io, table_id, player_left, [ position ]);
			return handleUpdateLobbyTables(io, socket);
		}
		// else if action is on player or if player has cards(is in the hand)
		// show them as having left the table room(not removed yet)
		await tablePlayerDb.updateInTableRoom(table_id, user_id, false);
		if (callback) callback(user_chips);
		await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
		await handleTablePlayerPayloads(io, table_id, player_left, []);
		return handleUpdateLobbyTables(io, socket);
	} catch (e) {
		return handleError('Error leaving table.', e, socket);
	}
};
