const db	= require('../dbConfig.js');

// config
const {
	constants,
}	= require('../../config/index.js');

const {
	gameTypes,
}	= constants;

const positionOrderToJoin = [ 0, 3, 5, 2, 4, 1 ];

const updateAction = async (table_id, position, trx) => {
	const knex = trx ? trx : db;
	await knex('table-players').where({ table_id, action: true }).update({ action: false });
	if (position !== undefined) {
		return knex('table-players').where({ table_id, position }).update({ action: true });
	}
};

const updateEndAction = async (table_id, position, trx) => {
	const knex = trx ? trx : db;
	await knex('table-players').where({ table_id, end_action: true }).update({ end_action: false });
	if (position !== undefined) {
		return knex('table-players').where({ table_id, position }).update({ end_action: true });
	}
};

module.exports = {
	deleteTablePlayer: (table_id, user_id) => db('table-players').where({ table_id, user_id }).del(),
	getTablePlayerByUserId: async user_id => {
		const tablePlayer = await db('table-players')
			.select('action', 'bet', 'cards', 'end_action', 'position', 'table_chips', 'table_id')
			.where({ user_id })
			.orderBy('join_date', 'desc')
			.first();
		if (!tablePlayer) throw new Error(`No table player found with user id ${ user_id }.`);
		return tablePlayer;
	},
	getTablePlayersByTableId: table_id => (
		db('table-players')
			.select('dealer_btn', 'in_table_room', 'position', 'table_chips', 'user_id')
			.where({ table_id })
	),
	getTablePlayersOrderedByPosition: table_id => (
		db('table-players')
			.where({ table_id })
			.select('cards', 'dealer_btn', 'end_action', 'position', 'table_chips', 'user_id')
			.orderBy('position')
	),
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
			// if user is already a player at the table, just return their current user_chips
			if (user_ids && user_ids.includes(user_id)) {
				const user_chips = await userDb.getUserChips(user_id, trx);
				await trx.commit();
				return user_chips;
			}
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
	resetActions: async table_id => {
		const trx = await db.transaction();
		try {
			await updateAction(table_id, null, trx);
			await updateEndAction(table_id, null, trx);
			return trx.commit();
		} catch (e) {
			await trx.rollback();
			throw new Error(e);
		}
	},
	resetTablePlayer: (table_id, user_id) => (
		db('table-players')
			.update({ action: false, dealer_btn: false, end_action: false, position: 0 })
			.where({ table_id, user_id })
	),
	resetTimerEnd: table_id => (
		db('table-players').where({ table_id }).havingNotNull('timer_end').update({ timer_end: null })
	),
	takePlayerChips: (table_id, user_id, chipsToTake) => (
		db('table-players')
			.decrement('table_chips', chipsToTake)
			.increment('bet', chipsToTake)
			.where({ table_id, user_id })
	),
	updateAction,
	updateActions: async (table_id, position) => {
		const trx = await db.transaction();
		try {
			await updateAction(table_id, position, trx);
			await updateEndAction(table_id, position, trx);
			return trx.commit();
		} catch (e) {
			await trx.rollback();
			throw new Error(e);
		}
	},
	updateCardsByPosition: (table_id, position, cards) => (
		db('table-players')
			.update({ cards: JSON.stringify(cards) })
			.where({ table_id, position })
			.returning('position')
	),
	updateDealerBtn: async (table_id, position) => {
		await db('table-players').where({ table_id, dealer_btn: true }).update({ dealer_btn: false });
		return db('table-players').where({ table_id, position }).update({ dealer_btn: true });
	},
	updateEndAction,
	updateInTableRoom: (table_id, user_id, in_table_room) => {
		// if player is re-joining table, also update the join date
		if (in_table_room) return db('table-players')
			.where({ table_id, user_id })
			.update({ in_table_room, join_date: db.fn.now() });
		// else just update in_table_room
		return db('table-players').where({ table_id, user_id }).update({ in_table_room });
	},
};
