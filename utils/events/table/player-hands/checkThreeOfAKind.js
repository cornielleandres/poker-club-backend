module.exports = sortedHand => {
	const { checkTwoPair, getCardRankDisplay } = require('./index.js');
	// if there are 3 cards whose ranks are all equal, you have 3 of a kind
	for (let i = 0; i <= sortedHand.length - 3; i++) {
		if (
			sortedHand[i].rank === sortedHand[i + 1].rank &&
			sortedHand[i + 1].rank === sortedHand[i + 2].rank
		) {
			return {
				hand: [
					sortedHand[i],
					sortedHand[i + 1],
					sortedHand[i + 2],
				],
				kickers:
					i === 0 ? [sortedHand[3], sortedHand[4]] :
						i === 1 ? [sortedHand[0], sortedHand[4]] :
							[sortedHand[0], sortedHand[1]],
				description: `Three ${ getCardRankDisplay(sortedHand[i].rank) }'s`,
				handRanking: 3,
			};
		}
	}
	return checkTwoPair(sortedHand);
};
