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
	gameTypes,
	reset_timer_end,
	table_room,
	take_player_chips,
	update_action_chat,
}	= constants;

module.exports = async (io, socket, raiseAmount) => {
	const {
		getNextPlayer,
		getPlayerIfActionOnPlayer,
		handleIfNextPlayerDisconnected,
		handleShowdown,
		handleTablePlayerPayloads,
		handleUpdateActionAndTimer,
	}	= require('../../index.js');
	let table_id;
	try {
		const { user_id } = socket;
		const tablePlayer = await getPlayerIfActionOnPlayer(user_id);
		table_id = tablePlayer.table_id;
		await tablePlayerDb.resetTimerEnd(table_id);
		await handleTablePlayerPayloads(io, table_id, reset_timer_end);
		const { bet: playerBet, position: playerPosition, table_chips } = tablePlayer;
		const {
			call_amount,
			game_type,
			hand_id,
			players,
			pot,
			street,
			table_type,
		} = await tableDb.getTable(table_id);
		// player's bet can never be greater than the amount they need to call
		if (playerBet > call_amount) throw new Error(betGreaterThanCallAmountError);
		if (game_type === gameTypes[1]) { // PL Omaha
			const lastPotAmount = pot[ pot.length - 1 ].amount;
			const allBets = players.reduce((bets, player) => player ? bets += player.bet : bets, 0);
			if (raiseAmount > allBets + (call_amount - playerBet) + lastPotAmount) {
				throw new Error('You cannot raise more than the pot.');
			}
		}
		// take appropriate chips from player
		const playerRaise = raiseAmount - playerBet;
		const chipsToTake = Math.min(table_chips, playerRaise);
		const bet = (await tablePlayerDb.takePlayerChips(table_id, user_id, chipsToTake))[0];
		await handleTablePlayerPayloads(io, table_id, take_player_chips, [ playerPosition ], 2000);
		const actionChatPayload = {
			type: 'raise',
			payload: {
				amount: bet,
				description: call_amount ? 'raised to' : 'bet',
				user_id,
			},
		};
		await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
		// update end_action to the player that made the raise
		await tablePlayerDb.updateEndAction(table_id, playerPosition);
		const nextActionPlayer = await getNextPlayer(table_id, 'action');
		// if there is no next action player, that means that everyone at the table is all in
		if (!nextActionPlayer) return handleShowdown(io, table_id);
		else {
			const nextActionPosition = nextActionPlayer.position;
			// the amount needed to call is now the raised amount
			await tableDb.updateCallAmount(table_id, raiseAmount);
			// update action and timer to be on next appropriate player at table
			await handleUpdateActionAndTimer(io, table_id, nextActionPosition, table_type, street, hand_id);
		}
		// if next player to act is not connected to table room, perform the default action(check or fold)
		return handleIfNextPlayerDisconnected(io, table_id);
	} catch (e) {
		const errMsg = 'Player Raise Error: ' + e.toString();
		console.log(errMsg);
		if (table_id) return io.in(table_room + table_id).emit(error_message, errMsg);
		return socket.emit(error_message, errMsg);
	}
};
