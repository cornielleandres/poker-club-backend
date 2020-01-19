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
	update_action_chat,
	update_actions,
}	= constants;

const new_hand = 'new_hand';

module.exports = async (io, table_id) => {
	const {
		delay,
		handleGetNewCards,
		handleRemovePlayers,
		handleTablePlayerPayloads,
		handleTakeBlinds,
		handleUpdateActionAndTimer,
		handleUpdateLobbyTables,
	} = require('../../index.js');
	try {
		await tablePlayerDb.resetActions(table_id);
		await handleTablePlayerPayloads(io, table_id, update_actions);
		// remove any players that have left the table room or have no table chips left
		await handleRemovePlayers(io, table_id);
		const tablePlayers = await tablePlayerDb.getTablePlayersByTableId(table_id);
		// if there are no more players left at the table after player removals
		if (!tablePlayers || tablePlayers.length === 0) {
			await tableDb.deleteTable(table_id); // delete the table
			return handleUpdateLobbyTables(io); // then update the lobby tables to reflect this deleted table
		}
		const tablePlayersLen = tablePlayers.length;
		// if there is only 1 player left at the table, do not get a new game,
		// instead, reset the table and wait for another player to join
		if (tablePlayersLen === 1) {
			await tableDb.resetTable(table_id);
			// reset action, dealer_btn, and end_action; and put this sole player in position 0
			// so when someone else joins, they get to start off OTB by default
			await tablePlayerDb.resetTablePlayer(table_id, tablePlayers[0].user_id);
			return handleTablePlayerPayloads(io, table_id, new_hand);
		}
		const { big_blind, hand_id, street, table_type } = (await tableDb.updateTableForNewHand(table_id))[0];
		// by default, give actions and dealerBtn to player in position 0
		let nextPlayerOnBtnPosition = 0;
		let nextActionsPosition = 0;
		const dealerBtnIdx = tablePlayers.findIndex(p => p.dealer_btn);
		if (dealerBtnIdx !== -1) { // if there was previously a player OTB
			// give the btn to the next player
			const nextDealerBtnIdx = dealerBtnIdx === tablePlayersLen - 1 ? 0 : dealerBtnIdx + 1;
			const nextDealeBtnPlayer = tablePlayers[ nextDealerBtnIdx ];
			nextPlayerOnBtnPosition = nextDealeBtnPlayer.position;
			// if there are > 3 players in the hand, actions will be 3 seats after next dealerBtn player
			let nextActionPlayer;
			if (tablePlayersLen > 3) {
				let actionIdx = nextDealerBtnIdx;
				let i = 3;
				while(i--) actionIdx = actionIdx === tablePlayersLen - 1 ? 0 : actionIdx + 1;
				nextActionPlayer = tablePlayers[ actionIdx ];
			} else nextActionPlayer = nextDealeBtnPlayer; // else action will be on next dealerBtn player
			nextActionsPosition = nextActionPlayer.position;
		}
		await tablePlayerDb.updateDealerBtn(table_id, nextPlayerOnBtnPosition);
		await tablePlayerDb.resetHandDescriptions(table_id);
		await tablePlayerDb.resetHideCards(table_id);
		await handleTablePlayerPayloads(io, table_id, new_hand);
		const actionChatPayload = { type: 'new_hand', payload: hand_id };
		await handleTablePlayerPayloads(io, table_id, update_action_chat, null, 1000, actionChatPayload);
		await handleGetNewCards.playerCards(io, table_id);
		await handleTakeBlinds(io, table_id, big_blind);
		await tablePlayerDb.updateEndAction(table_id, nextActionsPosition);
		await delay(3000); // delay before starting the timer
		return handleUpdateActionAndTimer(io, table_id, nextActionsPosition, table_type, street, hand_id);
	} catch (e) {
		const errMsg = 'Get New Hand: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
