module.exports = sortedHand => {
	const { checkHighCard, getCardRankDisplay } = require('./index.js');
	for (let i = 0; i <= sortedHand.length - 2; i++) {
		// if you find 2 consecutive sorted cards of equal rank, you have a pair
		if (sortedHand[i].rank === sortedHand[i + 1].rank) {
			return {
				hand: [
					sortedHand[i],
					sortedHand[i + 1],
				],
				kickers:
					i === 0 ? [sortedHand[2], sortedHand[3], sortedHand[4]] :
						i === 1 ? [sortedHand[0], sortedHand[3], sortedHand[4]] :
							i === 2 ? [sortedHand[0], sortedHand[1], sortedHand[4]] :
								[sortedHand[0], sortedHand[1], sortedHand[2]],
				description: `Pair of ${ getCardRankDisplay(sortedHand[i].rank) }'s`,
				handRanking: 1,
			};
		}
	}
	return checkHighCard(sortedHand);
};
