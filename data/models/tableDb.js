const db	= require('../dbConfig.js');

// config
const {
	constants,
}	= require('../../config/index.js');

const {
	initialCommunityCards,
	initialDeck,
	initialPot,
	streets,
	tableTypes,
	totalTimeNormal,
	totalTimeTurbo,
} = constants;

const {
	preflop,
}	= streets;

const tableDoesNotExistError = 'This table does not exist.';

module.exports = {
	addTable: table => db('tables').insert(table).returning('id'),
	deleteTable: id => db('tables').where({ id }).del(),
	getBigBlindGameTypeAndMaxPlayers: async (id, trx) => {
		const knex = trx ? trx : db;
		const table = await knex('tables')
			.select('big_blind', 'game_type', 'max_players')
			.where({ id })
			.first();
		if (!table) throw new Error(tableDoesNotExistError);
		return table;
	},
	getCallAmountByTableId: id => db('tables').select('call_amount').where({ id }).first(),
	getDeckAndCommunityCards: id => db('tables').select('community_cards', 'deck').where({ id }).first(),
	getDeckAndGameType: id => db('tables').select('deck', 'game_type').where({ id }).first(),
	getLobbyTables: async () => {
		const { tablePlayerDb }	= require('./index.js');
		let lobbyTables = await db('tables')
			.select('id', 'big_blind', 'game_type', 'max_players', 'table_type')
			.orderBy('id');
		const lobbyTableIds = lobbyTables.map(table => table.id);
		const lobbyTablePlayers = await tablePlayerDb.getLobbyTablePlayersByTableIds(lobbyTableIds);
		lobbyTables = lobbyTables.map(table => {
			table.players = [];
			const { id, max_players, players } = table;
			for (let i = 0; i < max_players; i++) players.push(null);
			const tablePlayers = lobbyTablePlayers.filter(player => player.table_id === id);
			tablePlayers.forEach(player => players[ player.position ] = player);
			return table;
		});
		return lobbyTables;
	},
	getStreetAndHandId: async id => db('tables').select('street', 'hand_id').where({ id }).first(),
	getTable: async id => {
		const { tablePlayerDb }	= require('./index.js');
		const table = await db('tables').where({ id }).select(
			'big_blind',
			'call_amount',
			'community_cards',
			'game_type',
			'hand_id',
			'id',
			'max_players',
			'pot',
			'street',
			'table_type',
		).first();
		if (!table) throw new Error(tableDoesNotExistError);
		const tablePlayers = await tablePlayerDb.getTablePlayersOrderedByPosition(id);
		table.players = [];
		const { max_players, players, table_type } = table;
		for (let i = 0; i < max_players; i++) players.push(null);
		tablePlayers.forEach(player => {
			const { position } = player;
			if (player.action) {
				if (table_type === tableTypes[1]) player.total_time = totalTimeTurbo; // tableTypes[1] === Turbo
				else player.total_time = totalTimeNormal;
			}
			players[ position ] = player;
		});
		return table;
	},
	resetTable: id => (
		db('tables').update({ call_amount: 0, pot: JSON.stringify(initialPot), street: '' }).where({ id })
	),
	updateCallAmount: (id, call_amount) => db('tables').update({ call_amount }).where({ id }),
	updateCommunityCards: (id, community_cards) => (
		db('tables').update({ community_cards: JSON.stringify(community_cards) }).where({ id })
	),
	updateDeck: (id, deck) => db('tables').update({ deck: JSON.stringify(deck) }).where({ id }),
	updatePot: (id, pot) => db('tables').update({ pot: JSON.stringify(pot) }).where({ id }),
	updateStreetAndResetCallAmount: (id, street) => (
		db('tables').update({ street, call_amount: 0 }).where({ id })
	),
	updateTableForNewHand: async id => {
		const { big_blind, hand_id } = await db('tables').where({ id }).select('big_blind', 'hand_id').first();
		return db('tables')
			.where({ id })
			.update({
				call_amount: big_blind,
				community_cards: JSON.stringify(initialCommunityCards),
				deck: JSON.stringify(initialDeck),
				hand_id: hand_id + 1,
				pot: JSON.stringify(initialPot),
				street: preflop,
			})
			.returning([ 'big_blind', 'hand_id', 'street', 'table_type' ]);
	},
};
