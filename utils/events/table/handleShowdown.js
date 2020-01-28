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
	streets,
	table_room,
}	= constants;

const {
	preflop,
	river,
}	= streets;

module.exports = async (io, table_id) => {
	const {
		distributePotToWinners,
		getNextStreet,
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
		const { game_type, players, pot, street } = table;
		let { community_cards } = table;
		// take all the bets made on this round of betting and update the pot with them
		await handleUpdatePotAndResetBets(io, table_id, pot);
		const endActionIndex = players.findIndex(p => p && p.end_action);
		// reorder table players to start with player in end_action position
		const reorderedPlayers = players.slice(endActionIndex).concat(players.slice(0, endActionIndex));
		// if not at the river yet, everyone's cards need to be revealed
		// and you need to run out the streets until getting to the river
		if (street !== river) {
			const playerCardsToReveal = reorderedPlayers
				.filter(p => p && p.cards.length && isNonEmptyObject(p.cards[0]))
				.map(p => ({ position: p.position, user_id: p.user_id }));
			await revealPlayerCards(io, table_id, playerCardsToReveal, game_type);
			// run out the streets here
			let nextStreet = getNextStreet(street);
			do {
				// update to the next street
				await tableDb.updateStreetAndResetCallAmount(table_id, nextStreet);
				// update the community cards accordingly with the new street
				community_cards = await handleGetNewCards.communityCards(io, table_id, nextStreet);
				// then move on to the next street
				nextStreet = getNextStreet(nextStreet);
			} while (nextStreet !== preflop);
		}
		const tablePlayers = await tablePlayerDb.getTablePlayersOrderedByPosition(table_id);
		const winners = await getWinners(io, table_id, tablePlayers, community_cards, pot, game_type);
		await distributePotToWinners(io, table_id, pot, winners, tablePlayers, game_type);
		return handleGetNewHand(io, table_id);
	} catch (e) {
		const errMsg = 'Showdown Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
