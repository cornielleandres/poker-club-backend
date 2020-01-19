module.exports = (players, winners) => {
	const { getMaxRank, handleCheckKickers } = require('./index.js');
	const { handRanking } = players[0].handInfo;
	switch(handRanking) {
	// if players have a royal flush, its a split pot
	case 9:
		return winners.push(players);
		// if players have a straight flush or a straight
	case 8:
	case 4: {
		// check to see who has the best straight
		const maxStraightRank = getMaxRank(players, 0);
		const maxStraightPlayers = players.filter(p => p.handInfo.hand[0].rank === maxStraightRank);
		return winners.push(maxStraightPlayers);
	}
	// if players have a full house
	case 6: {
		// check to see who has the best 'trips' part of the full house
		const maxTripsRank = getMaxRank(players, 0);
		const maxTripsPlayers = players.filter(p => p.handInfo.hand[0].rank === maxTripsRank);
		// if one player has the best 'trips' part of the full house
		if (maxTripsPlayers.length === 1) return winners.push(maxTripsPlayers);
		// else check to see who has the best 'pair' part of the full house
		const maxPairRank = getMaxRank(maxTripsPlayers, 3);
		const maxPairPlayers = players.filter(p => p.handInfo.hand[3].rank === maxPairRank);
		return winners.push(maxPairPlayers);
	}
	// if players have a flush
	case 5: {
		// check to see who has the best flush
		let maxFlushRank;
		let maxFlushPlayers = players;
		const numOfMaxFlushRanks = 5; // 5 cards make a flush
		// loop through all the flush ranks
		for (let i = 0; i < numOfMaxFlushRanks; i++) {
			// figure out the current max flush
			maxFlushRank = getMaxRank(maxFlushPlayers, i);
			// filter out the players that have this current max flush
			maxFlushPlayers = maxFlushPlayers.filter(p => p.handInfo.hand[i].rank === maxFlushRank);
			// if one player has this max flush, return them as the winner
			if (maxFlushPlayers.length === 1) return winners.push(maxFlushPlayers);
			// else continue in the loop to the next max flush
		}
		// if the flush loop finished without finding a single winner,
		// its a split pot between all the remaining players
		return winners.push(maxFlushPlayers);
	}
	// if players have two pair
	case 2: {
		// check to see who has the best big pair
		const maxBigPairRank = getMaxRank(players, 0);
		const maxBigPairPlayers = players.filter(p => p.handInfo.hand[0].rank === maxBigPairRank);
		// if one player has the best big pair
		if (maxBigPairPlayers.length === 1) return winners.push(maxBigPairPlayers);
		// else check to see who has the best small pair
		const maxSmallPairRank = getMaxRank(maxBigPairPlayers, 2);
		const maxSmallPairPlayers = maxBigPairPlayers
			.filter(p => p.handInfo.hand[2].rank === maxSmallPairRank);
		// if one player has the best small pair
		if (maxSmallPairPlayers.length === 1) return winners.push(maxSmallPairPlayers);
		// else check to see who has the best kicker
		return handleCheckKickers(maxSmallPairPlayers, winners);
	}
	// if players have four of a kind, three of a kind, a pair, or a high card
	case 7: // four of a kind
	case 3: // three of a kind
	case 1: // a pair
	default: { // high card
		// check to see who has the best rank
		const maxRank = getMaxRank(players, 0);
		const maxRankPlayers = players.filter(p => p.handInfo.hand[0].rank === maxRank);
		// if one player has the best rank
		if (maxRankPlayers.length === 1) return winners.push(maxRankPlayers);
		// else check to see who has the best kicker(s)
		return handleCheckKickers(maxRankPlayers, winners);
	}
	}
};
