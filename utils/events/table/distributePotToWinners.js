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
	give_chips_to_player,
	table_room,
	update_action_chat,
}	= constants;

module.exports = async (
	io,
	table_id,
	potToDistribute,
	winnersToDistribute,
	tablePlayers,
	big_blind,
	game_type,
) => {
	const {
		handleError,
		handleTablePlayerPayloads,
		revealPlayerCards,
		updateHandDescriptions,
	}	= require('../../index.js');
	try {
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
			// if tablePlayers array is present, it means cards possibly need to be revealed
			if (tablePlayers) {
				// update the players array with each player's updated/current hide_cards variable
				let tablePlayersUpdatedHiddenCards = await tablePlayerDb.getTablePlayersOrderedByPosition(table_id);
				const players = tablePlayers.map(p => {
					const tablePlayerUpdated = tablePlayersUpdatedHiddenCards.find(tp => tp.position === p.position);
					if (p.hide_cards !== tablePlayerUpdated.hide_cards) p.hide_cards = tablePlayerUpdated.hide_cards;
					return p;
				});
				const endActionIdx = players.findIndex(p => p.end_action);
				if (endActionIdx === -1) throw new Error('Player that ends action not found.');
				let playersStartingFromEndAction;
				if (endActionIdx) { // if end action player is NOT in index 0
					playersStartingFromEndAction = players.slice(endActionIdx).concat(players.slice(0, endActionIdx));
				} else { // else if end action player is in index 0
					playersStartingFromEndAction = players;
				}
				// reveal player cards of current pot players who have not show their cards yet
				// from player in end_action position (player who last bet/raised or started the hand)
				// all the way to the pot winner(s)
				const currPotUserIds = currPot.user_ids;
				const currPotPlayersStartingFromEndAction = playersStartingFromEndAction
					.filter(p => currPotUserIds.includes(p.user_id));
				// if there are players with hidden cards in the current pot
				if (currPotPlayersStartingFromEndAction.filter(p => p.hide_cards).length) {
					const firstWinnerIdx = currPotPlayersStartingFromEndAction
						.findIndex(p => p.user_id === currWinners[0].user_id);
					if (firstWinnerIdx === -1) throw new Error('First winner of pot not found in pot players.');
					// reveal the hidden cards of every player with a better winning hand than the previous player
					// up to the first winner of the pot
					// and then reveal the hidden cards of every winner after that
					const playersToReveal = [];
					for (let i = 0; i < firstWinnerIdx; i++) {
						const lastPlayerToReveal = playersToReveal[playersToReveal.length - 1];
						const currPlayer = currPotPlayersStartingFromEndAction[i];
						if (lastPlayerToReveal) {
							// if the current player has an equal or better hand than the last player to reveal,
							// then reveal current player's cards
							if (currPlayer.handInfo.handRanking >= lastPlayerToReveal.handInfo.handRanking) {
								playersToReveal.push(currPlayer);
							}
						} else playersToReveal.push(currPlayer);
					}
					const playerCardsToReveal = playersToReveal
						.concat(currWinners) // add all the winners
						.filter(p => p.hide_cards) // get only those players with hidden cards, in order to reveal them
						.map(p => ({ cards: p.cards, handInfo: p.handInfo, position: p.position, user_id: p.user_id }));
					await revealPlayerCards(io, table_id, playerCardsToReveal, game_type, true);
				} else {
					// else if there are players with revealed cards, update their hand descriptions
					const playersWithRevealedCards = currPotPlayersStartingFromEndAction.filter(p => !p.hide_cards);
					await updateHandDescriptions(io, table_id, playersWithRevealedCards);
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
		return handleError('Error distributing pot to winner(s).', e, null, io, table_room + table_id);
	}
};
