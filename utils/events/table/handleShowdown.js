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
	gameTypes,
	streets,
	table_room,
}	= constants;

const {
	preflop,
	flop,
	river,
}	= streets;

module.exports = async (io, table_id) => {
	const {
		distributePotToWinners,
		getNextStreet,
		handleDiscardTimers,
		handleError,
		handleGetNewCards,
		handleGetNewHand,
		handleUpdatePotAndResetBets,
		isNonEmptyObject,
		revealPlayerCards,
	} = require('../../index.js');
	const { getWinners }	= require('./player-hands/index.js');
	try {
		const table = await tableDb.getTable(table_id);
		await tablePlayerDb.resetActions(table_id);
		const { game_type, players, pot, street, table_type } = table;
		let { big_blind, community_cards } = table;
		const crazyPineapple = gameTypes[2];
		// take all the bets made on this round of betting and update the pot with them
		await handleUpdatePotAndResetBets(io, table_id, pot);
		let nextStreet = street;
		let tablePlayers = await tablePlayerDb.getTablePlayersOrderedByPosition(table_id);
		const updateStreetCardsAndGetWinnersAndNewHand = async usePrevPlayers => {
			// check if you can use the previously gotten table players because
			// if cards got discarded, you need the new players with the updated cards
			if (!usePrevPlayers) tablePlayers = await tablePlayerDb.getTablePlayersOrderedByPosition(table_id);
			// if not at the river yet, everyone's cards need to be revealed
			// and you need to run out the streets until getting to the river
			if (street !== river) {
				const endActionIndex = players.findIndex(p => p && p.end_action);
				// reorder table players to start with player in end_action position
				const reorderedPlayers = players.slice(endActionIndex).concat(players.slice(0, endActionIndex));
				const playerCardsToReveal = reorderedPlayers
					.filter(p => p && p.cards.length && isNonEmptyObject(p.cards[0]))
					.map(p => ({ cards: p.cards, position: p.position, user_id: p.user_id }));
				await revealPlayerCards(io, table_id, playerCardsToReveal, game_type);
				// run out the streets
				nextStreet = getNextStreet(nextStreet);
				do {
					// update to the next street
					await tableDb.updateStreetAndResetCallAmount(table_id, nextStreet);
					// update the community cards accordingly with the new street
					community_cards = await handleGetNewCards.communityCards(io, table_id, nextStreet);
					// then move on to the next street
					nextStreet = getNextStreet(nextStreet);
				} while (nextStreet !== preflop);
			}
			const winners = await getWinners(io, table_id, tablePlayers, community_cards, pot, game_type);
			await distributePotToWinners(io, table_id, pot, winners, tablePlayers, big_blind, game_type);
			return handleGetNewHand(io, table_id);
		};
		// if playing Crazy Pineapple, and the turn has not been revealed yet,
		// have players in hand discard one of their cards at the flop
		if (game_type === crazyPineapple && (street === preflop || street === flop)) {
			if (street === preflop) {
				// update to the next street (in this case, the flop)
				nextStreet = flop;
				await tableDb.updateStreetAndResetCallAmount(table_id, nextStreet);
				// update the community cards accordingly with the new street
				community_cards = await handleGetNewCards.communityCards(io, table_id, nextStreet);
			}
			// filter out the players with cards in front of them (are still in the hand)
			const playersWithCards = tablePlayers.filter(p => p.cards.length && isNonEmptyObject(p.cards[0]));
			return handleDiscardTimers(
				io,
				table_id,
				table_type,
				playersWithCards,
				updateStreetCardsAndGetWinnersAndNewHand,
			);
		}
		return updateStreetCardsAndGetWinnersAndNewHand(true);
	} catch (e) {
		return handleError('Error handling showdown.', e, null, io, table_room + table_id);
	}
};
