module.exports = (handSuits, sortedHand) => {
	const { checkFourOfAKind, checkStraightFlush } = require('./index.js');
	for (let key in handSuits) {
		if (handSuits[key] >= 5) {
			const suitedCards = [];
			for (let i = 0; i < sortedHand.length; i++) {
				if (sortedHand[i].suit === key) {
					suitedCards.push(sortedHand[i]);
				}
			}
			// if all the suited card ranks are A through 10, you have a royal flush
			if (
				suitedCards[0].rank === 14 &&
				suitedCards[1].rank === 13 &&
				suitedCards[2].rank === 12 &&
				suitedCards[3].rank === 11 &&
				suitedCards[4].rank === 10
			) {
				return {
					hand: [
						suitedCards[0],
						suitedCards[1],
						suitedCards[2],
						suitedCards[3],
						suitedCards[4],
					],
					kickers: [],
					description: 'Royal Flush!',
					handRanking: 9,
				};
			}
			return checkStraightFlush(suitedCards);
		}
	}
	return checkFourOfAKind(sortedHand);
};
