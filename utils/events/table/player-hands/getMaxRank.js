module.exports = (players, cardIndex, kickers) => players.reduce((maxRank, player) => {
	const currRank = kickers ? player.handInfo.kickers[cardIndex].rank : player.handInfo.hand[cardIndex].rank;
	return maxRank = Math.max(currRank, maxRank);
}, 0);
