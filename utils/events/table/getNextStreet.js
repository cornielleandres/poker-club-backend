const {
	constants,
}	= require('../../../config/index.js');

const {
	streets,
}	= constants;

const {
	preflop,
	flop,
	turn,
	river,
}	= streets;

module.exports = street => {
	switch(street) {
	case preflop:
		return flop;
	case flop:
		return turn;
	case turn:
		return river;
	default:
		return preflop;
	}
};
