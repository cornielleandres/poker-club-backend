module.exports = sortedHand => {
	const { checkStraight, getCardRankDisplay } = require('./index.js');
	// filter out Aces whose ranks are one
	const filteredSortedHand = sortedHand.filter(hand => hand.rank !== 1);
	for (let i = 0; i <= filteredSortedHand.length - 3; i++) {
		// if you have 3 cards of the same rank, you have 3 of a kind
		// move on to check for a pair
		if (
			filteredSortedHand[i].rank === filteredSortedHand[i + 1].rank &&
			filteredSortedHand[i + 1].rank === filteredSortedHand[i + 2].rank
		) {
			for (let j = 0; j <= filteredSortedHand.length - 2; j++) {
				// if you find a pair apart from the 3 of a kind previously found,
				// you have a full house
				if (j !== i && j !== i + 1 && j !== i + 2) {
					if (filteredSortedHand[j].rank === filteredSortedHand[j + 1].rank) {
						return {
							hand: [
								filteredSortedHand[i],
								filteredSortedHand[i + 1],
								filteredSortedHand[i + 2],
								filteredSortedHand[j],
								filteredSortedHand[j + 1],
							],
							kickers: [],
							description: `Full House: ${ getCardRankDisplay(filteredSortedHand[i].rank) }'s Over ${ getCardRankDisplay(filteredSortedHand[j].rank) }'s`,
							handRanking: 6,
						};
					}
				}
			}
		}
	}
	return checkStraight(sortedHand);
};
