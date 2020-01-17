module.exports = suitedCards => {
	const { getCardRankDisplay } = require('./index.js');
	// filter out Aces whose ranks are one
	const filteredSuitedCards = suitedCards.filter(hand => hand.rank !== 1);
	// since you always have at least 5 suited cards when you get to this point,
	// it will always return a flush
	return {
		hand: [
			filteredSuitedCards[0],
			filteredSuitedCards[1],
			filteredSuitedCards[2],
			filteredSuitedCards[3],
			filteredSuitedCards[4],
		],
		kickers: [],
		description: `${ getCardRankDisplay(filteredSuitedCards[0].rank) }-High Flush`,
		handRanking: 5,
	};
};
