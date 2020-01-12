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
	const {
		handleGetNewCards,
		handleRemovePlayers,
		handleTablePlayerPayloads,
		handleTakeBlinds,
	} = require('../../index.js');
	try {
		// remove any players that have left the table room or have no table chips left
		await handleRemovePlayers(io, table_id);
		const tablePlayers = await tablePlayerDb.getTablePlayersByTableId(table_id);
		// if there are no more players left at the table after player removals, do nothing further
		if (!tablePlayers || tablePlayers.length === 0) return;
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
		const big_blind = (await tableDb.updateTableForNewHand(table_id))[0];
		await tablePlayerDb.resetActions(table_id);
		// by default, give actions and dealerBtn to player in position 0
		let nextPlayerOnBtnPosition = 0;
		let nextActionsPosition = 0;
		const dealerBtnIdx = tablePlayers.findIndex(p => p.dealer_btn);
		// if there was previously a player OTB
		if (dealerBtnIdx !== -1) {
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
			// else action will be on next dealerBtn player
			} else nextActionPlayer = nextDealeBtnPlayer;
			nextActionsPosition = nextActionPlayer.position;
		}
		await tablePlayerDb.updateDealerBtn(table_id, nextPlayerOnBtnPosition);
		await handleTablePlayerPayloads(io, table_id, new_hand);
		await handleGetNewCards(io, table_id);
		await handleTakeBlinds(io, table_id, big_blind);
		await tablePlayerDb.updateActions(table_id, nextActionsPosition);
		return handleTablePlayerPayloads(io, table_id, 'update_actions');
	} catch (e) {
		const errMsg = 'Get New Hand: ' + e.toString();
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
