const db	= require('../dbConfig.js');

// config
const {
	constants,
}	= require('../../config/index.js');

const {
	bigBlinds,
	gameTypes,
	initialCommunityCards,
	initialDeck,
	initialPot,
	maxPlayers,
	streets,
	tableTypes,
	totalTimeNormal,
	totalTimeTurbo,
} = constants;

const {
	preflop,
}	= streets;

module.exports = {
	addTable: table => {
		const { big_blind, game_type, max_players, table_type } = table;
		if (!bigBlinds.includes(big_blind)) throw new Error(`Big blind "${ big_blind }" not allowed.`);
		if (!gameTypes.includes(game_type)) throw new Error(`Game type "${ game_type }" not allowed.`);
		if (!maxPlayers.includes(max_players)) throw new Error(`Max players "${ max_players }" not allowed.`);
		if (!tableTypes.includes(table_type)) throw new Error(`Table type ${ table_type } not allowed.`);
		return db('tables').insert(table).returning('id');
	},
	deleteTable: id => db('tables').where({ id }).del(),
	getDeckGameTypeAndPositions: async id => {
		const { deck, game_type } = await db('tables').where({ id }).select('deck', 'game_type').first();
		const { positions } = await db('table-players')
			.select(db.raw('ARRAY_AGG(position) as positions'))
			.where({ table_id: id })
			.first();
		return { deck, game_type, positions };
	},
	getLobbyTables: async () => {
		let lobbyTables = await db('tables')
			.select('id', 'big_blind', 'game_type', 'max_players', 'table_type')
			.orderBy('id');
		const lobbyTableIds = lobbyTables.map(table => table.id);
		const lobbyTablePlayers = await db('table-players as tp')
			.select('tp.in_table_room', 'u.picture', 'tp.position', 'tp.table_id', 'tp.user_id')
			.whereIn('table_id', lobbyTableIds)
			.join('users as u', 'tp.user_id', 'u.id');
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
	getTable: async id => {
		const table = await db('tables').where({ id }).select(
			'big_blind',
			'call_amount',
			'community_cards',
			'game_type',
			'hand_id',
			'max_players',
			'pot',
			'street',
			'table_type',
		).first();
		if (!table) throw new Error('This table does not exist.');
		const tablePlayers = await db('table-players as tp')
			.where({ table_id: id })
			.select(
				'tp.bet',
				'tp.action',
				'tp.cards',
				'tp.end_action',
				'tp.dealer_btn',
				'tp.in_table_room',
				'u.name',
				'u.picture',
				'tp.position',
				'tp.table_chips',
				'tp.timer_end',
				'tp.user_id',
			)
			.join('users as u', 'tp.user_id', 'u.id');
		table.players = [];
		const { max_players, players, table_type } = table;
		for (let i = 0; i < max_players; i++) players.push(null);
		tablePlayers.forEach(user => {
			const { position } = user;
			if (user.action) {
				// tableTypes[1] === Turbo
				if (table_type === tableTypes[1]) user.total_time = totalTimeTurbo;
				else user.total_time = totalTimeNormal;
			}
			players[ position ] = user;
		});
		return table;
	},
	resetTable: id => (
		db('tables').update({ call_amount: 0, pot: JSON.stringify(initialPot), street: '' }).where({ id })
	),
	updateDeck: (id, deck) => db('tables').update({ deck: JSON.stringify(deck) }).where({ id }),
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
			});
	},
};
