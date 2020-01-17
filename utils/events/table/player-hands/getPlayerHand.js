module.exports = cards => {
	const { checkRoyalFlush } = require('./index.js');
	const sortedHand = [];
	const handSuits = {
		club: 0,
		diamond: 0,
		heart: 0,
		spade: 0,
	};
	cards.forEach(card => {
		if (card && card.rank) { // checking for card.rank excludes empty objects gotten from community cards
			if (card.rank === 14) {
				sortedHand.push(
					{ rank: 1, suit: card.suit },
					card,
				);
			} else sortedHand.push(card);
			handSuits[card.suit]++;
		}
	});
	sortedHand.sort((a, b) => b.rank - a.rank);
	// start by checking for a royal flush, going down towards a high-card
	return checkRoyalFlush(handSuits, sortedHand);
};
