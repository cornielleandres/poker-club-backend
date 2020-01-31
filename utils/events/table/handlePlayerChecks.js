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
	betGreaterThanCallAmountError,
	error_message,
	reset_timer_end,
	streets,
	table_room,
	update_action_chat,
}	= constants;

const {
	preflop,
}	= streets;

module.exports = async (io, socket, userId) => {
	const {
		getPlayerIfActionOnPlayer,
		getNextPlayer,
		handleEndOfAction,
		handleIfNextPlayerDisconnected,
		handleTablePlayerPayloads,
		handleUpdateActionAndTimer,
	} = require('../../index.js');
	let table_id;
	try {
		const user_id = socket ? socket.user_id : userId;
		const tablePlayer = await getPlayerIfActionOnPlayer(user_id);
		table_id = tablePlayer.table_id;
		await tablePlayerDb.resetTimerEnd(table_id);
		await handleTablePlayerPayloads(io, table_id, reset_timer_end);
		const { bet } = tablePlayer;
		const table = await tableDb.getTable(table_id);
		const { call_amount, hand_id, players, street, table_type } = table;
		// player's bet can never be greater than the amount they need to call
		if (bet > call_amount) throw new Error(betGreaterThanCallAmountError);
		const actionChatPayload = { type: 'check', payload: { description: 'checked', user_id } };
		await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
		const nextActionPlayer = await getNextPlayer(table_id, 'action');
		if (!nextActionPlayer) throw new Error('Could not get next action player after check.');
		const nextActionPosition = nextActionPlayer.position;
		const { position: endActionPosition } = players.find(p => p && p.end_action);
		// if the next action falls on the player who ends the action
		if (endActionPosition === nextActionPosition) {
			// if player checked preflop,
			// it must be the case that they were on the big_blind and last to act,
			// and as such, update the pot and reset all bets
			const updatePotAndResetBets = street === preflop;
			await handleEndOfAction(io, table, updatePotAndResetBets);
		// else update action and timer to be on next appropriate player at table
		} else await handleUpdateActionAndTimer(io, table_id, nextActionPosition, table_type, street, hand_id);
		// if next player to act is not connected to table room, perform the default action(check or fold)
		return handleIfNextPlayerDisconnected(io, table_id);
	} catch (e) {
		const errMsg = 'Player Check Error: ' + e.toString();
		console.log(errMsg);
		if (table_id) return io.in(table_room + table_id).emit(error_message, errMsg);
		if (socket) return socket.emit(error_message, errMsg);
	}
};
