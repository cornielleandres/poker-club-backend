module.exports = rank => (
	rank < 11 ? rank : rank === 11 ? 'J' : rank === 12 ? 'Q' : rank === 13 ? 'K' : 'A'
);
