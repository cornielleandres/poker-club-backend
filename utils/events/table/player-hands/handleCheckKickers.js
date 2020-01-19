module.exports = (players, winners) => {
	const { getMaxRank }	= require('./index.js');
	let maxKickerRank;
	let maxKickerPlayers = players;
	const numOfMaxKickers = players[0].handInfo.kickers.length;
	// loop through all the kickers
	for (let i = 0; i < numOfMaxKickers; i++) {
		// get the current max kicker
		maxKickerRank = getMaxRank(maxKickerPlayers, i, true);
		// filter out the players that have this current max kicker
		maxKickerPlayers = maxKickerPlayers.filter(p => p.handInfo.kickers[i].rank === maxKickerRank);
		// if one player has this max kicker, return them as the winner
		if (maxKickerPlayers.length === 1) return winners.push(maxKickerPlayers);
		// else continue in the loop to the next max kicker
	}
	// if the kicker loop finished without finding a single winner,
	// its a split pot between all the remaining players
	return winners.push(maxKickerPlayers);
};
