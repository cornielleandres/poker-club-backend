const db	= require('../dbConfig.js');

// config
const {
	constants,
}	= require('../../config/index.js');

const {
	gameTypes,
}	= constants;

const positionOrderToJoin = [ 0, 3, 5, 2, 4, 1 ];

const getTablePlayerPositionsAsArray = (table_id, trx) => {
	const knex = trx ? trx : db;
	return knex('table-players')
		.select(knex.raw('ARRAY_AGG(position) as positions'))
		.where({ table_id })
		.first();
};

const resetDiscardTimerEnd = (table_id, positions) => (
	db('table-players')
		.update({ discard_timer_end: null })
		.whereIn('position', positions)
		.andWhere({ table_id })
		.havingNotNull('discard_timer_end')
);

const resetTimerEnd = table_id => (
	db('table-players').update({ timer_end: null }).where({ table_id }).havingNotNull('timer_end')
);

const updateAction = async (table_id, position, trx) => {
	const knex = trx ? trx : db;
	await knex('table-players').update({ action: false }).where({ table_id, action: true });
	if (position !== undefined) {
		return knex('table-players').update({ action: true }).where({ table_id, position });
	}
};

const updateEndAction = async (table_id, position, trx) => {
	const knex = trx ? trx : db;
	await knex('table-players').update({ end_action: false }).where({ table_id, end_action: true });
	if (position !== undefined) {
		return knex('table-players').update({ end_action: true }).where({ table_id, position });
	}
};

module.exports = {
	deleteTablePlayer: (table_id, user_id) => db('table-players').where({ table_id, user_id }).del(),
	foldCards: (table_id, user_id) => (
		db('table-players').update({ cards: JSON.stringify([]) }).where({ table_id, user_id })
	),
	getActionPlayerByTableId: table_id => (
		db('table-players').select('bet', 'position', 'user_id').where({ table_id, action: true }).first()
	),
	getAllPlayerBets: table_id => (
		db('table-players').select('bet', 'position', 'user_id').where({ table_id }).andWhere('bet', '>', 0)
	),
	getLobbyTablePlayersByTableIds: tableIds => (
		db('table-players as tp')
			.select('tp.in_table_room', 'u.picture', 'tp.position', 'tp.table_id', 'tp.user_id')
			.whereIn('table_id', tableIds)
			.join('users as u', 'tp.user_id', 'u.id')
	),
	getPlayerCardsAndPositionsByTableId: table_id => (
		db('table-players').select('cards', 'position').where({ table_id })
	),
	getTableIdByUserId: user_id => (
		db('table-players')
			.select('table_id')
			.where({ user_id })
			.orderBy('join_date', 'desc')
			.first()
	),
	getTablePlayerByUserId: async user_id => {
		const tablePlayer = await db('table-players')
			.select('action', 'bet', 'cards', 'end_action', 'position', 'table_chips', 'table_id')
			.where({ user_id })
			.orderBy('join_date', 'desc')
			.first();
		if (!tablePlayer) throw new Error(`No table player found with user id ${ user_id }.`);
		return tablePlayer;
	},
	getTablePlayerPositionsAsArray,
	getTablePlayersByTableId: table_id => (
		db('table-players')
			.select('dealer_btn', 'in_table_room', 'position', 'table_chips', 'user_id')
			.where({ table_id })
	),
	getTablePlayersOrderedByPosition: table_id => (
		db('table-players as tp')
			.select(
				'tp.action',
				'tp.bet',
				'tp.cards',
				'tp.dealer_btn',
				'tp.discard_timer_end',
				'tp.end_action',
				'tp.hand_description',
				'tp.hide_cards',
				'tp.in_table_room',
				'u.name',
				'u.picture',
				'tp.position',
				'tp.table_chips',
				'tp.timer_end',
				'tp.user_id',
			)
			.where({ table_id })
			.join('users as u', 'tp.user_id', 'u.id')
			.orderBy('tp.position')
	),
	giveChipsToPlayer: (table_id, user_id, amount) => (
		db('table-players').increment('table_chips', amount).where({ table_id, user_id }).returning('position')
	),
	joinTable: async (table_id, user_id) => {
		const trx = await db.transaction();
		try {
			const { tableDb, userDb }	= require('./index.js');
			const {
				big_blind,
				game_type,
				max_players,
			} = await tableDb.getBigBlindGameTypeAndMaxPlayers(table_id, trx);
			const { positions } = await getTablePlayerPositionsAsArray(table_id, trx);
			const { user_ids } = await trx('table-players')
				.select(trx.raw('ARRAY_AGG(user_id) as user_ids'))
				.where({ table_id })
				.first();
			// if user is already a player at the table, just return their current user_chips
			if (user_ids && user_ids.includes(user_id)) {
				const user_chips = await userDb.getUserChips(user_id, trx);
				await trx.commit();
				return user_chips;
			}
			const positionsLen = positions ? positions.length : 0;
			if (max_players <= positionsLen) throw new Error('Table is full. You cannot join.');
			const { table_chips, user_chips } = await userDb.takeBuyInFromUserChips(user_id, big_blind, trx);
			// join the first position in the positionOrderToJoin array that is not taken
			const position = positions ? positionOrderToJoin.find(p => !positions.includes(p)) : 0;
			const newTablePlayer = { position, table_chips, table_id, user_id };
			// gameTypes[1] === PL Omaha
			switch(game_type) {
			case gameTypes[1]: // PL Omaha
				newTablePlayer.cards = JSON.stringify([ {}, {}, {}, {} ]);
				break;
			case gameTypes[2]: // Crazy Pineapple
				newTablePlayer.cards = JSON.stringify([ {}, {}, {} ]);
				break;
			default: // default is NL Hold 'Em
				break;
			}
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
	resetBets: async table_id => (
		db('table-players').update({ bet: 0 }).where({ table_id }).andWhere('bet', '>', 0)
	),
	resetDiscardTimerEnd,
	resetHandDescriptions: table_id => (
		db('table-players').update({ hand_description: '' }).where({ table_id })
	),
	resetHideCards: table_id => (
		db('table-players').update({ hide_cards: true }).where({ table_id, hide_cards: false })
	),
	resetTablePlayer: (table_id, user_id) => (
		db('table-players')
			.update({ action: false, dealer_btn: false, end_action: false, position: 0 })
			.where({ table_id, user_id })
	),
	resetTimerEnd,
	takePlayerChips: (table_id, user_id, chipsToTake) => (
		db('table-players')
			.decrement('table_chips', chipsToTake)
			.increment('bet', chipsToTake)
			.where({ table_id, user_id })
			.returning('bet')
	),
	updateAction,
	updateCardsByPosition: (table_id, position, cards) => (
		db('table-players')
			.update({ cards: JSON.stringify(cards) })
			.where({ table_id, position })
			.returning([ 'position', 'user_id' ])
	),
	updateDiscardTimerEnd: async (table_id, positions, discard_timer_end) => {
		await resetDiscardTimerEnd(table_id, positions);
		return db('table-players')
			.update({ discard_timer_end })
			.whereIn('position', positions)
			.andWhere({ table_id });
	},
	updateDealerBtn: async (table_id, position) => {
		await db('table-players').update({ dealer_btn: false }).where({ table_id, dealer_btn: true });
		return db('table-players').update({ dealer_btn: true }).where({ table_id, position });
	},
	updateEndAction,
	updateHandDescription: (table_id, user_id, hand_description) => (
		db('table-players').update({ hand_description }).where({ table_id, user_id })
	),
	updateHideCards: (table_id, user_id, hide_cards) => (
		db('table-players').update({ hide_cards }).where({ table_id, user_id })
	),
	updateInTableRoom: (table_id, user_id, in_table_room) => {
		// if player is re-joining table, also update the join date
		if (in_table_room) return db('table-players')
			.update({ in_table_room, join_date: db.fn.now() })
			.where({ table_id, user_id });
		// else just update in_table_room
		return db('table-players').where({ table_id, user_id }).update({ in_table_room });
	},
	updateTimerEnd: async (table_id, position, timer_end) => {
		await resetTimerEnd(table_id);
		return db('table-players').update({ timer_end }).where({ table_id, position });
	},
};
