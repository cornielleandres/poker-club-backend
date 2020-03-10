// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	take_player_chips,
}	= constants;

module.exports = async (io, table_id, big_blind) => {
	const { handleTablePlayerPayloads, isNonEmptyObject }	= require('../../index.js');
	try {
		// tablePlayers will filter out those who arrived late and did not get dealt into the current hand
		const tablePlayers = (await tablePlayerDb.getTablePlayersOrderedByPosition(table_id))
			.filter(p => p.cards.length && isNonEmptyObject(p.cards[0]));
		const numOfPlayers = tablePlayers.length;
		const small_blind = big_blind / 2;
		let smallBlindPlayer;
		let bigBlindPlayer;
		const dealerBtnIdx = tablePlayers.findIndex(p => p.dealer_btn);
		if (typeof(dealerBtnIdx) !== 'number') throw new Error('Player on dealer button not found.');
		// if there are only 2 players, small blind is taken from player OTB
		if (numOfPlayers === 2) {
			smallBlindPlayer = tablePlayers[ dealerBtnIdx ];
			const bigBlindIdx = dealerBtnIdx === numOfPlayers - 1 ? 0 : dealerBtnIdx + 1;
			bigBlindPlayer = tablePlayers[ bigBlindIdx ];
		} else { // else if there are 3 or more players
			const smallBlindIdx = dealerBtnIdx === numOfPlayers - 1 ? 0 : dealerBtnIdx + 1;
			smallBlindPlayer = tablePlayers[ smallBlindIdx ];
			const bigBlindIdx = smallBlindIdx === numOfPlayers - 1 ? 0 : smallBlindIdx + 1;
			bigBlindPlayer = tablePlayers[ bigBlindIdx ];
		}
		const {
			position: smallBlindPosition,
			table_chips: smallBlindTableChips,
			user_id: smallBlindUserId,
		} = smallBlindPlayer;
		const smallBlindChipsToTake = Math.min(smallBlindTableChips, small_blind);
		await tablePlayerDb.takePlayerChips(table_id, smallBlindUserId, smallBlindChipsToTake);
		await handleTablePlayerPayloads(io, table_id, take_player_chips, [ smallBlindPosition ], 2000);
		const {
			position: bigBlindPosition,
			table_chips: bigBlindTableChips,
			user_id: bigBlindUserId,
		} = bigBlindPlayer;
		const bigBlindChipsToTake = Math.min(bigBlindTableChips, big_blind);
		await tablePlayerDb.takePlayerChips(table_id, bigBlindUserId, bigBlindChipsToTake);
		return handleTablePlayerPayloads(io, table_id, take_player_chips, [ bigBlindPosition ]);
	} catch (e) {
		throw new Error('Error taking blinds: ' + e);
	}
};
