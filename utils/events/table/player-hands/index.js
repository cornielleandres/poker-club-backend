const checkFlush							= require('./checkFlush.js');
const checkFourOfAKind				= require('./checkFourOfAKind.js');
const checkFullHouse					= require('./checkFullHouse.js');
const checkHighCard						= require('./checkHighCard.js');
const checkPair								= require('./checkPair.js');
const checkRoyalFlush					= require('./checkRoyalFlush.js');
const checkStraight						= require('./checkStraight.js');
const checkStraightFlush			= require('./checkStraightFlush.js');
const checkThreeOfAKind				= require('./checkThreeOfAKind.js');
const checkTwoPair						= require('./checkTwoPair.js');
const getCardRankDisplay			= require('./getCardRankDisplay.js');
const getMaxRank							= require('./getMaxRank.js');
const getPlayerHand						= require('./getPlayerHand.js');
const getPlayerHands					= require('./getPlayerHands.js');
const getWinners							= require('./getWinners.js');
const handleCheckKickers			= require('./handleCheckKickers.js');
const handlePossibleSplitPot	= require('./handlePossibleSplitPot.js');

module.exports = {
	checkFlush,
	checkFourOfAKind,
	checkFullHouse,
	checkHighCard,
	checkPair,
	checkRoyalFlush,
	checkStraight,
	checkStraightFlush,
	checkThreeOfAKind,
	checkTwoPair,
	getCardRankDisplay,
	getMaxRank,
	getPlayerHand,
	getPlayerHands,
	getWinners,
	handleCheckKickers,
	handlePossibleSplitPot,
};
