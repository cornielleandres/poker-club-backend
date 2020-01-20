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
	give_chips_to_player,
	table_room,
	update_action_chat,
}	= constants;

module.exports = async (io, table_id, pot, onePlayerWithCardsLeft) => {
	try {
		const { handleTablePlayerPayloads }	= require('../../index.js');
		// take all the bets made on this round of betting and update the pot with them
		let playerBets = await tablePlayerDb.getAllPlayerBets(table_id);
		if (playerBets.length) {
			const playerBetPositions = playerBets.map(playerBet => playerBet.position);
			playerBets.sort((a, b) => a.bet - b.bet);
			const potLen = pot.length;
			const lastPot = pot[ potLen - 1 ];
			const baseAmount = playerBets[0].bet;
			let amount = lastPot.amount;
			const user_ids = [ ...lastPot.user_ids ];
			playerBets.forEach(playerBet => {
				playerBet.bet -= baseAmount;
				amount += baseAmount;
				if (!user_ids.includes(playerBet.user_id)) user_ids.push(playerBet.user_id);
			});
			playerBets = playerBets.filter(playerBet => playerBet.bet);
			pot[ potLen - 1 ] = { amount, user_ids };
			while(playerBets.length) {
				const baseAmount = playerBets[0].bet;
				let amount = 0;
				const user_ids = [];
				playerBets.forEach(playerBet => {
					playerBet.bet -= baseAmount;
					amount += baseAmount;
					user_ids.push(playerBet.user_id);
				});
				playerBets = playerBets.filter(playerBet => playerBet.bet);
				pot.push({ amount, user_ids });
			}
			await tableDb.updatePot(table_id, pot);
			await tablePlayerDb.resetBets(table_id);
			await handleTablePlayerPayloads(io, table_id, 'update_pot_with_bets', playerBetPositions, 2000);
			// check to see if the last pot has only one user_id in it.
			// if there is also one player with cards left, do not give them the chips back as they will
			// automatically win the pot later on, else, give that pot as chips back to that player
			const newLastPotIdx = pot.length - 1;
			const newLastPot = pot[ newLastPotIdx ];
			if (newLastPot.user_ids.length === 1 && !onePlayerWithCardsLeft) {
				const user_id = newLastPot.user_ids[0];
				const newLastPotAmount = newLastPot.amount;
				const position = (await tablePlayerDb.giveChipsToPlayer(table_id, user_id, newLastPotAmount))[0];
				pot.splice(newLastPotIdx, 1);
				await tableDb.updatePot(table_id, pot);
				const actionChatPayload = {
					type: 'given_chips_back',
					payload: {
						amount: newLastPotAmount,
						user_ids: [ user_id ],
					},
				};
				await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
				await handleTablePlayerPayloads(io, table_id, give_chips_to_player, [ position ], 2000);
			}
		}
	} catch (e) {
		const errMsg = 'Update Pot And Reset Bets Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
