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
	river,
}	= streets;

module.exports = async (io, table, updatePotAndResetBets) => {
	let table_id;
	try {
		const {
			getNextPlayer,
			getNextStreet,
			handleGetNewCards,
			handleShowdown,
			handleUpdateActionAndTimer,
			handleUpdatePotAndResetBets,
			isNonEmptyObject,
		} = require('../../index.js');
		const {
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
		const playersWithCards = players.filter(c => c.cards.length && isNonEmptyObject(c.cards[0]));
		const allNonZeroTableChips = playersWithCards.filter(p => p.table_chips);
		if (allNonZeroTableChips.length < 2) return handleShowdown(io, table_id);
		// else if there are at least 2 live players still left
		// update to the next street and reset call_amount to 0
		const nextStreet = getNextStreet(street);
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
	} catch (e) {
		const errMsg = 'End of Action Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
