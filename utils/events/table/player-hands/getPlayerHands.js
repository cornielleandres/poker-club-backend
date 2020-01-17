module.exports = (players, communityCards, omaha) => {
	const { getPlayerHand, handlePossibleSplitPot }	= require('./index.js');
	if (omaha) {
		const communityCardsLen = communityCards.length;
		return players.forEach(p => {
			const hands = [];
			const { cards } = p;
			const cardsLen = cards.length;
			for (let i = 0; i < cardsLen - 1; i++) {
				for (let j = i + 1; j < cardsLen; j++) {
					for (let k = 0; k < communityCardsLen - 2; k++) {
						for (let l = k + 1; l < communityCardsLen - 1; l++) {
							for (let m = l + 1; m < communityCardsLen; m++) {
								const currCards = [
									cards[i],
									cards[j],
									communityCards[k],
									communityCards[l],
									communityCards[m],
								];
								hands.push(getPlayerHand(currCards));
							}
						}
					}
				}
			}
			// get the best hand ranking
			const maxRanking = hands.reduce((maxRank, h) => {
				return maxRank = Math.max(h.handRanking, maxRank);
			}, 0);
			const maxRankingHands = hands.filter(h => h.handRanking === maxRanking);
			if (maxRankingHands.length === 1) p.hand = maxRankingHands[0];
			// else if there are multiple hands with the same hand ranking
			else {
				const maxHandsArr = maxRankingHands.map(hand => ({ hand }));
				const winners = [];
				handlePossibleSplitPot(maxHandsArr, winners);
				p.hand = winners[0][0].hand;
			}
		});
	} 
	return players.forEach(p => p.hand = getPlayerHand(p.cards.concat(communityCards)));
};
