const db	= require('../dbConfig.js');

// config
const {
	constants,
}	= require('../../config/index.js');

const {
	gameTypes,
}	= constants;

const positionOrderToJoin = [ 0, 3, 5, 2, 4, 1 ];

module.exports = {
	deleteTablePlayer: (table_id, user_id) => db('table-players').where({ table_id, user_id }).del(),
	getTablePlayerByUserId: async user_id => {
		const tablePlayer = await db('table-players').where({ user_id }).first();
		if (!tablePlayer) throw new Error(`No table player found with user_id ${ user_id }.`);
		return tablePlayer;
	},
	getTablePlayersOrderedByPosition: table_id => db('table-players').where({ table_id }).orderBy('position'),
	joinTable: async (table_id, user_id) => {
		const trx = await db.transaction();
		try {
			const { userDb }	= require('./index.js');
			const table = await trx('tables')
				.select('big_blind', 'game_type', 'max_players')
				.where({ id: table_id })
				.first();
			if (!table) throw new Error(`Table #${ table_id } does not exist.`);
			const { positions, user_ids } = await trx('table-players')
				.select(trx.raw('ARRAY_AGG(position) as positions'), trx.raw('ARRAY_AGG(user_id) as user_ids'))
				.where({ table_id })
				.first();
			const { big_blind, game_type, max_players } = table;
			if (user_ids && user_ids.includes(user_id)) return;
			const positionsLen = positions ? positions.length : 0;
			if (max_players <= positionsLen) throw new Error('Table is full. You cannot join.');
			const { table_chips, user_chips } = await userDb.takeBuyInFromUserChips(user_id, big_blind, trx);
			const position = positions ? positionOrderToJoin.find(p => !positions.includes(p)) : 0;
			const newTablePlayer = { position, table_chips, table_id, user_id };
			// gameTypes[1] === PL Omaha
			if (game_type === gameTypes[1]) newTablePlayer.cards = JSON.stringify([ {}, {}, {}, {} ]);
			await trx('table-players').insert(newTablePlayer);
			await trx.commit();
			return user_chips;
		} catch (e) {
			await trx.rollback();
			throw new Error(e);
		}
	},
	updateEndAction: async (table_id, position) => {
		await db('table-players').where({ table_id, end_action: true }).update({ end_action: false });
		await db('table-players').where({ table_id, position }).update({ end_action: true });
	},
	updateInTableRoom: (table_id, user_id, in_table_room) => (
		db('table-players').where({ table_id, user_id }).update({ in_table_room })
	),
};
