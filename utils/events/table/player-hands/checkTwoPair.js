module.exports = sortedHand => {
	const { checkPair, getCardRankDisplay } = require('./index.js');
	// filter out Aces whose ranks are one
	const filteredSortedHand = sortedHand.filter(hand => hand.rank !== 1);
	for (let i = 0; i <= filteredSortedHand.length - 4; i++) {
		// if 2 consecutive sorted cards of equal rank are found, you have a pair
		if (filteredSortedHand[i].rank === filteredSortedHand[i + 1].rank) {
			for (let j = i + 2; j <= filteredSortedHand.length - 2; j++) {
				// if another pair is found apart from the first pair, you have two pair
				if (filteredSortedHand[j].rank === filteredSortedHand[j + 1].rank) {
					return {
						hand: [
							filteredSortedHand[i],
							filteredSortedHand[i + 1],
							filteredSortedHand[j],
							filteredSortedHand[j + 1],
						],
						kickers: [
							i === 0 ? j === 2 ? filteredSortedHand[4] : filteredSortedHand[2] :
								filteredSortedHand[0]
						],
						description: `Two Pairs: ${ getCardRankDisplay(filteredSortedHand[i].rank) }'s & ${ getCardRankDisplay(filteredSortedHand[j].rank) }'s`,
						handRanking: 2,
					};
				}
			}
		}
	}
	return checkPair(sortedHand);
};
