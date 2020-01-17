module.exports = sortedHand => {
	const { checkThreeOfAKind, getCardRankDisplay } = require('./index.js');
	// filter out the duplicate ranks
	const noDuplicatesSortedHand = sortedHand.filter((card, pos, arr) => {
		return !pos || card.rank !== arr[pos - 1].rank;
	});

	// if there are 5 cards whose ranks are consecutive, you have a straight
	for (let i = 0; i <= noDuplicatesSortedHand.length - 5; i++) {
		if (
			noDuplicatesSortedHand[i].rank - 1 === noDuplicatesSortedHand[i + 1].rank &&
			noDuplicatesSortedHand[i + 1].rank - 1 === noDuplicatesSortedHand[i + 2].rank &&
			noDuplicatesSortedHand[i + 2].rank - 1 === noDuplicatesSortedHand[i + 3].rank &&
			noDuplicatesSortedHand[i + 3].rank - 1 === noDuplicatesSortedHand[i + 4].rank
		) {
			return {
				hand: [
					noDuplicatesSortedHand[i],
					noDuplicatesSortedHand[i + 1],
					noDuplicatesSortedHand[i + 2],
					noDuplicatesSortedHand[i + 3],
					noDuplicatesSortedHand[i + 4],
				],
				kickers: [],
				description: `${ getCardRankDisplay(noDuplicatesSortedHand[i].rank) }-High Straight`,
				handRanking: 4,
			};
		}
	}
	return checkThreeOfAKind(sortedHand);
};
