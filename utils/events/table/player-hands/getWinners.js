// config
const {
	constants,
}	= require('../../../../config/index.js');

const {
	maxPlayers,
}	= constants;

module.exports = async (io, table_id, players, community_cards, pot, omaha) => {
	const { isNonEmptyObject }	= require('../../../index.js');
	const { getPlayerHands, handlePossibleSplitPot, updateHandDescriptions }	= require('./index.js');
	const defaultMaxPlayers = maxPlayers[0];
	const playersWithCards = players.filter(p => p && p.cards.length && isNonEmptyObject(p.cards[0]));
	getPlayerHands(playersWithCards, community_cards, omaha);
	await updateHandDescriptions(io, table_id, playersWithCards);
	const winners = [];
	pot.forEach(sidePot => {
		const potPlayers = playersWithCards.filter(p => sidePot.user_ids.includes(p.user_id));
		// check to see who has the best hand ranking
		const maxRanking = potPlayers.reduce((maxRanking, p) => {
			const currHandRanking = p.handInfo.handRanking;
			return maxRanking = Math.max(currHandRanking, maxRanking);
		}, 0);
		const maxRankingPlayers = potPlayers.filter(p => p.handInfo.handRanking === maxRanking);
		// if one player has the best hand ranking
		if (maxRankingPlayers.length === 1) return winners.push(maxRankingPlayers);
		// else if there are multiple players with the same hand ranking
		else {
			// find the dealer btn position
			const dealerBtnPos = players.find(p => p && p.dealer_btn).position;
			// sort the players by their positions
			maxRankingPlayers.sort((a, b) => a.position - b.position);
			// the player in the worst position is the first one after the dealer btn
			let worstPos = dealerBtnPos === defaultMaxPlayers - 1 ? 0 : dealerBtnPos + 1;
			let worstPosPlayerIdx;
			let i = defaultMaxPlayers + 1; // to prevent while loop from continuing indefinitely
			// look for the player who is in the worst position
			while(i--) {
				worstPosPlayerIdx = maxRankingPlayers.findIndex(p => p.position === worstPos);
				// if the loop brought you back to the player in the dealer btn, something went wrong
				if (worstPos === dealerBtnPos) throw new Error('Get Winners: Could not get worst position');
				// else if the player in the worst position was found
				else if (worstPosPlayerIdx !== -1) {
					maxRankingPlayers[ worstPosPlayerIdx ].worstPosition = true;
					break;
				// else move on to the next position
				} else worstPos = worstPos === defaultMaxPlayers - 1 ? 0 : worstPos + 1;
			}
			return handlePossibleSplitPot(maxRankingPlayers, winners);
		}
	});
	return winners;
};
