module.exports = sortedHand => {
	const { getCardRankDisplay } = require('./index.js');
	// if you get to this point, you by default have a high card
	return {
		hand: [
			sortedHand[0],
		],
		kickers: [
			sortedHand[1],
			sortedHand[2],
			sortedHand[3],
			sortedHand[4],
		],
		description: `${ getCardRankDisplay(sortedHand[0].rank) }-High`,
		handRanking: 0,
	};
};
