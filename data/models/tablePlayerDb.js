const db	= require('../dbConfig.js');

// config
const {
	constants,
}	= require('../../config/index.js');

// models
const {
	userDb,
}	= require('./index.js');

const {
	gameTypes,
}	= constants;

module.exports = {
	joinTable: async (table_id, user_id) => {
		const trx = await db.transaction();
		try {
			const table = await trx('tables')
				.select('big_blind', 'game_type', 'max_players')
				.where({ id: table_id })
				.first();
			if (!table) throw new Error(`Table #${ table_id } does not exist.`);
			const { positions, user_ids } = await trx('table-players')
				.select(trx.raw('ARRAY_AGG(position) as positions'), trx.raw('ARRAY_AGG(user_id) as user_ids'))
				.where({ table_id })
				.first();
			if (user_ids.includes(user_id)) return;
			const positionsLen = positions.length;
			if (max_players <= positionsLen) throw new Error('Table is full. You cannot join.');
			const { table_chips, user_chips } = await userDb.takeBuyInFromUserChips(user_id, big_blind, trx);
			const { big_blind, game_type, max_players } = table;
			const newTablePlayer = { position: positionsLen, table_chips, table_id, user_id };
			// gameTypes[1] === PL Omaha
			if (game_type === gameTypes[1]) newTablePlayer.cards = JSON.stringify([ {}, {}, {}, {} ]);
			await trx('tables-players').insert(newTablePlayer);
			await trx.commit();
			return user_chips;
		} catch (e) {
			await trx.rollback();
			throw new Error(e);
		}
	},
};
