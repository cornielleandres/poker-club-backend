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

module.exports = async (
	io,
	table_id,
	potToDistribute,
	winnersToDistribute,
	players,
	big_blind,
	game_type,
) => {
	try {
		const { handleTablePlayerPayloads, revealPlayerCards }	= require('../../index.js');
		let pot = potToDistribute;
		let potLen = pot.length;
		let winners = winnersToDistribute;
		const winnersLen = winners.length;
		if (potLen !== winnersLen) throw new Error(`There are ${ potLen } pots but ${ winnersLen } winners.`);
		const oneWinnerTakesPot = winners.every(w => w.length === 1);
		const small_blind = big_blind / 2;
		const winnerTakesBlinds = pot[0].amount === big_blind && pot[1].amount === small_blind;
		// if one player is taking down the blinds, group the blinds into one pot before giving it to the player
		if (potLen === 2 && oneWinnerTakesPot && winnerTakesBlinds) {
			const winner = winners[0];
			const user_ids = [ winner.user_id ];
			const newWinners = [ winner ];
			const newPot = [ { amount: big_blind + small_blind, user_ids } ];
			await tableDb.updatePot(table_id, newPot);
			await handleTablePlayerPayloads(io, table_id, 'update_pot_with_bets', [], 2000);
			pot = newPot;
			potLen = newPot.length;
			winners = newWinners;
		}
		for (let i = potLen - 1; i >= 0; i--) {
			const currPot = pot[i];
			const currWinners = winners[i];
			const currWinnersLen = currWinners.length;
			const currPotAmount = currPot.amount;
			const amountWonPerPlayer = Math.floor(currPotAmount / currWinnersLen);
			// if players array is present, it means cards possibly need to be revealed
			if (players) {
				const filterHiddenCards = p => p.hide_cards;
				// reveal player cards of current pot players who have not show their cards yet
				// from player who last bet/raised (or started the hand) all the way to the pot winner(s)
				const currPotUserIds = currPot.user_ids;
				const currPotPlayers = players.filter(p => currPotUserIds.includes(p.user_id));
				const currPotPlayersWithHiddenCards = currPotPlayers.filter(filterHiddenCards);
				// if there are players with hidden cards in the current pot
				if (currPotPlayersWithHiddenCards.length) {
					const mapToPositionAndUserId = p => ({ position: p.position, user_id: p.user_id });
					const firstWinnerIdx = currPotPlayers.findIndex(p => p.user_id === currWinners[0].user_id);
					if (firstWinnerIdx === -1) throw new Error('First winner of pot not found in pot players');
					// reveal the cards of every player with hidden cards up to the first winner of the pot
					// and then reveal the cards of every winner with hidden cards after that
					const playerCardsToReveal = currPotPlayersWithHiddenCards
						.slice(0, firstWinnerIdx)
						.map(mapToPositionAndUserId)
						.concat(currWinners.filter(filterHiddenCards).map(mapToPositionAndUserId));
					await revealPlayerCards(io, table_id, playerCardsToReveal, game_type);
				}
			}
			for (let j = 0; j < currWinnersLen; j++) {
				const position = (await tablePlayerDb
					.giveChipsToPlayer(table_id, currWinners[j].user_id, amountWonPerPlayer))[0];
				currPot.amount -= amountWonPerPlayer;
				await tableDb.updatePot(table_id, pot);
				// when on the first winner of the side pot, send the action chat payload to announce the winner(s)
				if (j === 0) {
					const handInfo = currWinners[j].handInfo;
					const actionChatPayload = {
						type: 'given_pot',
						payload: {
							amount: currPotAmount,
							// no handInfo means player won pot without going to showdown(i.e. someone folded)
							description: handInfo ? handInfo.description : null,
							user_ids: currWinners.map(w => w.user_id),
						},
					};
					await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
				}
				await handleTablePlayerPayloads(io, table_id, give_chips_to_player, [ position ], 2000);
			}
			const oddChip = currPot.amount;
			if (oddChip) {
				if (oddChip !== 1) throw new Error(`Odd chip in split pot was not 1. It was ${ oddChip }.`);
				const winnerInWorstPosition = currWinners.find(p => p.worstPosition);
				const worstPosition = (await tablePlayerDb
					.giveChipsToPlayer(table_id, winnerInWorstPosition.user_id, oddChip))[0];
				currPot.amount -= oddChip;
				await tableDb.updatePot(table_id, pot);
				await handleTablePlayerPayloads(io, table_id, give_chips_to_player, [ worstPosition ], 2000);
			}
		}
	} catch (e) {
		const errMsg = 'Distribute Pot To Winners Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
