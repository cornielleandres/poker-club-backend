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
	flop,
	river,
}	= streets;

module.exports = async (io, table, updatePotAndResetBets) => {
	const {
		getNextPlayer,
		getNextStreet,
		handleDiscardTimers,
		handleError,
		handleGetNewCards,
		handleShowdown,
		handleUpdateActionAndTimer,
		handleUpdatePotAndResetBets,
		isNonEmptyObject,
	} = require('../../index.js');
	let table_id;
	try {
		const {
			game_type,
			hand_id,
			id,
			pot,
			street,
			table_type,
		} = table;
		table_id = id;
		// if on the river, its a showdown
		if (street === river) return handleShowdown(io, table_id);
		// else if not on the river:
		if (updatePotAndResetBets) await handleUpdatePotAndResetBets(io, table_id, pot);
		// check if there are at least 2 players with table_chips after updating pot
		// at the end of every street where there were bets/calls made
		// if there are not, that means that everyone is all in so just run out the streets
		// with no further user input
		const players = await tablePlayerDb.getTablePlayersOrderedByPosition(table_id);
		// filter out the players with cards in front of them (are still in the hand)
		const playersWithCards = players.filter(p => p.cards.length && isNonEmptyObject(p.cards[0]));
		const allNonZeroTableChips = playersWithCards.filter(p => p.table_chips);
		if (allNonZeroTableChips.length < 2) return handleShowdown(io, table_id);
		// if there are at least 2 live players still left:
		const nextStreet = getNextStreet(street);
		const updateStreetCardsTimerAndActions = async () => {
			// update to the next street and reset call_amount to 0
			await tableDb.updateStreetAndResetCallAmount(table_id, nextStreet);
			// update the community cards accordingly with the new street
			await handleGetNewCards.communityCards(io, table_id, nextStreet);
			// update both actions and timer to be on UTG player (player after dealer_btn with chips still left)
			const utgPlayer = await getNextPlayer(table_id, 'dealer_btn');
			if (!utgPlayer) throw new Error('No UTG player found.');
			const utgPosition = utgPlayer.position;
			await tablePlayerDb.resetActions(table_id);
			await tablePlayerDb.updateEndAction(table_id, utgPosition);
			return handleUpdateActionAndTimer(io, table_id, utgPosition, table_type, street, hand_id);
		};
		const crazyPineapple = gameTypes[2];
		// if playing Crazy Pineapple, and going from flop to turn,
		// have players in hand discard one of their cards
		if (game_type === crazyPineapple && street === flop) {
			return handleDiscardTimers(
				io,
				table_id,
				table_type,
				playersWithCards,
				updateStreetCardsTimerAndActions,
			);
		}
		return updateStreetCardsTimerAndActions();
	} catch (e) {
		return handleError('Error handling end of action.', e, null, io, table_room + table_id);
	}
};
