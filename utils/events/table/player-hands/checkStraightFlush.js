module.exports = suitedCards => {
	const { checkFlush, getCardRankDisplay } = require('./index.js');
	// if there are 5 suited cards whose ranks are consecutive, you have a straight flush
	for (let i = 0; i <= suitedCards.length - 5; i++) {
		if (
			suitedCards[i].rank - 1 === suitedCards[i + 1].rank &&
			suitedCards[i + 1].rank - 1 === suitedCards[i + 2].rank &&
			suitedCards[i + 2].rank - 1 === suitedCards[i + 3].rank &&
			suitedCards[i + 3].rank - 1 === suitedCards[i + 4].rank
		) {
			return {
				hand: [
					suitedCards[i],
					suitedCards[i + 1],
					suitedCards[i + 2],
					suitedCards[i + 3],
					suitedCards[i + 4],
				],
				kickers: [],
				description: `${ getCardRankDisplay(suitedCards[i].rank) }-High Straight Flush`,
				handRanking: 8,
			};
		}
	}
	return checkFlush(suitedCards);
};
