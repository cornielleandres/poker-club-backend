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
	update_action_chat,
}	= constants;

module.exports = async (io, socket, userId) => {
	const {
		distributePotToWinners,
		getPlayerIfActionOnPlayer,
		getNextPlayer,
		handleEndOfAction,
		handleError,
		handleGetNewHand,
		handleIfNextPlayerDisconnected,
		handleShowdown,
		handleTablePlayerPayloads,
		handleUpdateActionAndTimer,
		handleUpdatePotAndResetBets,
		isNonEmptyObject,
	} = require('../../index.js');
	let table_id;
	try {
		const user_id = socket ? socket.user_id : userId;
		const tablePlayer = await getPlayerIfActionOnPlayer(user_id);
		table_id = tablePlayer.table_id;
		await tablePlayerDb.resetTimerEnd(table_id);
		await handleTablePlayerPayloads(io, table_id, reset_timer_end);
		const { bet, position: playerPosition } = tablePlayer;
		const table = await tableDb.getTable(table_id);
		const { big_blind, call_amount, game_type, hand_id, players, pot, street, table_type } = table;
		// player's bet can never be greater than the amount they need to call
		if (bet > call_amount) throw new Error(betGreaterThanCallAmountError);
		// fold the player's cards
		await tablePlayerDb.foldCards(table_id, user_id);
		await handleTablePlayerPayloads(io, table_id, 'fold_cards', [ playerPosition ], 2000);
		const actionChatPayload = { type: 'fold', payload: { description: 'folded', user_ids: [ user_id ] } };
		await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
		let nextActionPlayer = await getNextPlayer(table_id, 'action');
		const updatePotAndResetBets = Boolean(nextActionPlayer);
		// if, at first, no next action player is found,
		// check to see if its because there is a pot that needs to be given back
		if (!nextActionPlayer) {
			await handleUpdatePotAndResetBets(io, table_id, pot);
			nextActionPlayer = await getNextPlayer(table_id, 'action');
		}
		// if after giving any pot back, there is still no ation player,
		// that means that everyone at the table is all in
		if (!nextActionPlayer) return handleShowdown(io, table_id);
		else {
			const nextActionPosition = nextActionPlayer.position;
			const playersWithCardsLeft = players.filter(p => {
				if (
					p && p.user_id !== user_id // is not the player that folded
					&& p.cards.length // has not previously folded
					&& isNonEmptyObject(p.cards[0]) // has entered the hand
				) return true;
				return false;
			});
			// if there is only one player with cards left after the fold,
			// that player will consequently take down the pot,
			// afterwards, get a new hand
			if (playersWithCardsLeft.length === 1) {
				await handleUpdatePotAndResetBets(io, table_id, pot, true);
				const playerToReceivePot = playersWithCardsLeft[0];
				const winners = [];
				let potLen = pot.length;
				while(potLen--) winners.push([ playerToReceivePot ]);
				await distributePotToWinners(io, table_id, pot, winners, null, big_blind, game_type);
				return handleGetNewHand(io, table_id);
			} else {
				// else if the next action falls on the player who ends the action(end_action)
				const { position: endActionPosition } = players.find(p => p && p.end_action);
				if (endActionPosition === nextActionPosition) {
					await handleEndOfAction(io, table, updatePotAndResetBets);
				} else {
					// else update action and timer to be on next appropriate player at table
					await handleUpdateActionAndTimer(io, table_id, nextActionPosition, table_type, street, hand_id);
				}
			}
		}
		// if next player to act is not connected to table room, perform the default action(check or fold)
		return handleIfNextPlayerDisconnected(io, table_id);
	} catch (e) {
		const errorIo = table_id ? io : null;
		return handleError('Error handling player fold.', e, socket, errorIo, table_room + table_id);
	}
};
