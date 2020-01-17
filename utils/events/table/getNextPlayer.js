// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	maxPlayers,
}	= constants;

const defaultMaxPlayers = maxPlayers[0];

module.exports = async (table_id, start) => {
	try {
		const { isNonEmptyObject } = require('../../index.js');
		const livePlayers = await tablePlayerDb.getTablePlayersOrderedByPosition(table_id);
		const currentLivePlayerIdx = livePlayers.findIndex(p => p[ start ]);
		const livePlayersLen = livePlayers.length;
		let nextLivePlayerIdx = currentLivePlayerIdx === livePlayersLen - 1 ? 0 : currentLivePlayerIdx + 1;
		let nextLivePlayer;
		// look for the next player who is in the hand and has chips left(is not all in)
		for (let i = 0; i < defaultMaxPlayers; i++) {
			nextLivePlayer = livePlayers[ nextLivePlayerIdx ];
			// if the loop brought you back to the current player,
			// it means no more input is required from players for this street, so return null
			if (currentLivePlayerIdx === nextLivePlayerIdx) return null;
			// move on to the next player if the following conditions are met
			else if (
				// if player folded
				!nextLivePlayer.cards.length
				// or if player has not entered the hand
				|| !isNonEmptyObject(nextLivePlayer.cards[0])
				// or if player has no chips left
				// AND you are not looking for the player that ends the action
				// AND player is not the one to end the action.
				// in other words, if looking for the next player after end_action,
				// and if they end the action themselves, they are allowed to have no chips
				|| (!nextLivePlayer.table_chips && start !== 'end_action' && !nextLivePlayer.end_action)
			) nextLivePlayerIdx = nextLivePlayerIdx === livePlayersLen - 1 ? 0 : nextLivePlayerIdx + 1;
			else break;
		}
		return nextLivePlayer;
	} catch (e) {
		const errMsg = 'Get Next Player Error: ' + e.toString();
		throw new Error(errMsg);
	}
};
