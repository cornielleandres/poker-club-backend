module.exports = (players, cardIndex, kickers) => players.reduce((maxRank, player) => {
	const currRank = kickers ? player.hand.kickers[cardIndex].rank : player.hand.hand[cardIndex].rank;
	return maxRank = Math.max(currRank, maxRank);
}, 0);
