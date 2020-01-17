module.exports = sortedHand => {
	const { checkFullHouse, getCardRankDisplay } = require('./index.js');
	for (let i = 0; i <= sortedHand.length - 4; i++) {
		// if there are 4 cards whose ranks are all equal, you have a 4 of a kind
		if (
			sortedHand[i].rank === sortedHand[i + 1].rank &&
			sortedHand[i + 1].rank === sortedHand[i + 2].rank &&
			sortedHand[i + 2].rank === sortedHand[i + 3].rank
		) {
			return {
				hand: [
					sortedHand[i],
					sortedHand[i + 1],
					sortedHand[i + 2],
					sortedHand[i + 3],
				],
				kickers: [ i === 0 ? sortedHand[4] : sortedHand[0] ],
				description: `Four ${ getCardRankDisplay(sortedHand[i].rank) }'s`,
				handRanking: 7,
			};
		}
	}
	return checkFullHouse(sortedHand);
};
