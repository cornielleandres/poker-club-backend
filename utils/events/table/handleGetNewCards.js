// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tableDb,
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	gameTypes,
	streets,
	update_action_chat,
	usersKey,
}	= constants;

const {
	flop,
	turn,
}	= streets;

const _getActionChatCards = (cards, street) => {
	switch(street) {
	case flop:
		return cards.slice(0, 3);
	case turn:
		return cards.slice(3, 4);
	default: // default is the river
		return cards.slice(4);
	}
};

const _getRandomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	// the maximum is exclusive and the minimum is inclusive
	return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = {
	communityCards: async (io, table_id, street) => {
		try {
			const { handleTablePlayerPayloads, isNonEmptyObject }	= require('../../index.js');
			const numOfCards = street === flop ? 3 : 1;
			const { community_cards, deck } = await tableDb.getDeckAndCommunityCards(table_id);
			let firstEmptyIndex = community_cards.findIndex(card => !isNonEmptyObject(card));
			const defaultDelayTime = 1000;
			for (let i = 0; i < numOfCards; i++) {
				const delayTime = i !== numOfCards - 1 ? defaultDelayTime : 0; // do not delay after last loop
				const randomInt = _getRandomInt(0, deck.length);
				const newCard = deck.splice(randomInt, 1)[0];
				community_cards[firstEmptyIndex] = newCard;
				await tableDb.updateCommunityCards(table_id, community_cards);
				await handleTablePlayerPayloads(io, table_id, 'community_card', [ firstEmptyIndex++ ], delayTime);
			}
			const actionChatPayload = {
				type: 'cards',
				payload: {
					cards: _getActionChatCards(community_cards, street),
					street,
				},
			};
			await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
			await tableDb.updateDeck(table_id, deck);
			return community_cards;
		} catch (e) {
			throw new Error('Community Cards Error: ' + e.toString());
		}
	},
	playerCards: async (io, table_id) => {
		try {
			const { handleTablePlayerPayloads, redisClient }	= require('../../index.js');
			const { deck, game_type } = await tableDb.getDeckAndGameType(table_id);
			const { positions } = await tablePlayerDb.getTablePlayerPositionsAsArray(table_id);
			const playerCardsLen = game_type === gameTypes[0] ? 2 // NL Hold 'Em
				: game_type === gameTypes[1] ? 4 // PL Omaha
					: 3; // Crazy Pineapple
			const delayTime = playerCardsLen * 1000;
			for (const position of positions) {
				const cards = [];
				for (let j = 0; j < playerCardsLen; j++) {
					const randomInt = _getRandomInt(0, deck.length);
					cards.push(deck.splice(randomInt, 1)[0]);
				}
				const updatedPlayer = (await tablePlayerDb.updateCardsByPosition(table_id, position, cards))[0];
				await handleTablePlayerPayloads(io, table_id, 'player_cards', [ position ], delayTime);
				if (updatedPlayer) {
					const redisClientKey = usersKey + updatedPlayer.user_id;
					const socketId = await redisClient.getAsync(redisClientKey);
					const actionChatPayload = { type: 'cards', payload: { cards } };
					io.to(socketId).emit(update_action_chat, actionChatPayload);
				}
			}
			return tableDb.updateDeck(table_id, deck);
		} catch (e) {
			throw new Error('Player Cards Error: ' + e.toString());
		}
	},
};
