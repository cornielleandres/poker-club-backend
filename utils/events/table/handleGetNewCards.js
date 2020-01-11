// databases
const {
	tableDb,
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const getRandomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	// the maximum is exclusive and the minimum is inclusive
	return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = async (io, table_id) => {
	const { constants }	= require('../../../config/index.js');
	const { delay, handleTablePlayerPayloads }	= require('../../index.js');
	const { gameTypes }	= constants;
	const { deck, game_type, positions } = await tableDb.getDeckGameTypeAndPositions(table_id);
	let playerCardsLen = 2;
	const fourHoleCards = game_type === gameTypes[1]; /// gameTypes[1] === PL Omaha
	if (fourHoleCards) playerCardsLen = 4;
	const delayTime = fourHoleCards ? 4000 : 2000;
	for (const position of positions) {
		const cards = [];
		for (let j = 0; j < playerCardsLen; j++) {
			const randomInt = getRandomInt(0, deck.length);
			cards.push(deck.splice(randomInt, 1)[0]);
		}
		const payloadPositions = await tablePlayerDb.updateCardsByPosition(table_id, position, cards);
		if (payloadPositions.length) await tableDb.updateDeck(table_id, deck);
		await handleTablePlayerPayloads(io, table_id, 'player_cards', payloadPositions);
		await delay(delayTime);
	}
};
