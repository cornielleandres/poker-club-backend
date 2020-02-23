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
	reset_timer_end,
	table_room,
	take_player_chips,
	update_action_chat,
}	= constants;

module.exports = async (io, socket) => {
	const {
		getNextPlayer,
		getPlayerIfActionOnPlayer,
		handleEndOfAction,
		handleError,
		handleIfNextPlayerDisconnected,
		handleTablePlayerPayloads,
		handleShowdown,
		handleUpdateActionAndTimer,
	} = require('../../index.js');
	let table_id;
	try {
		const { user_id } = socket;
		const tablePlayer = await getPlayerIfActionOnPlayer(user_id);
		table_id = tablePlayer.table_id;
		await tablePlayerDb.resetTimerEnd(table_id);
		await handleTablePlayerPayloads(io, table_id, reset_timer_end);
		const { bet: playerBet, position: playerPosition, table_chips } = tablePlayer;
		const table = await tableDb.getTable(table_id);
		const { call_amount, hand_id, players, street, table_type } = table;
		// player's bet can never be greater than the amount they need to call
		if (playerBet > call_amount) throw new Error(betGreaterThanCallAmountError);
		// take appropriate chips from player
		const playerCallAmount = call_amount - playerBet;
		const chipsToTake = Math.min(table_chips, playerCallAmount);
		await tablePlayerDb.takePlayerChips(table_id, user_id, chipsToTake);
		await handleTablePlayerPayloads(io, table_id, take_player_chips, [ playerPosition ], 2000);
		const actionChatPayload = {
			type: 'call',
			payload: {
				amount: chipsToTake,
				description: 'called',
				user_ids: [ user_id ],
			},
		};
		await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
		const nextActionPlayer = await getNextPlayer(table_id, 'action');
		// if there is no next action player, that means that everyone at the table is all in
		if (!nextActionPlayer) return handleShowdown(io, table_id);
		else {
			const nextActionPosition = nextActionPlayer.position;
			const { position: endActionPosition } = players.find(p => p && p.end_action);
			// else if the next action falls on the player who ends the action(end_action)
			if (endActionPosition === nextActionPosition) return handleEndOfAction(io, table, true);
			else {
				const tablePlayers = await tablePlayerDb.getTablePlayersOrderedByPosition(table_id);
				const allNonZeroTableChips = tablePlayers.filter(p => p.table_chips);
				// else if there is at most 1 player left with table chips(is not all in)
				// AND if the next action player has nothing to call(bet === call_amount)
				// this next action player does not have any option and everyone is forced to go to showdown
				if (allNonZeroTableChips.length < 2 && nextActionPlayer.bet === call_amount) {
					return handleShowdown(io, table_id);
				} else {
					// else update action and timer to be on next appropriate player at table
					await handleUpdateActionAndTimer(io, table_id, nextActionPosition, table_type, street, hand_id);
				}
			}
			// if next player to act is not connected to table room, perform the default action(check or fold)
			return handleIfNextPlayerDisconnected(io, table_id);
		}
	} catch (e) {
		const errorIo = table_id ? io : null;
		return handleError('Error handling player call.', e, socket, errorIo, table_room + table_id);
	}
};
