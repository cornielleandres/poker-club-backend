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

const updateDealerBtn = async (table_id, position, trx) => {
	const knex = trx ? trx : db;
	await knex('table-players').where({ table_id, dealer_btn: true }).update({ dealer_btn: false });
	return knex('table-players').where({ table_id, position }).update({ dealer_btn: true });
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
			.where({ user_id })
			.orderBy('join_date', 'desc')
			.first();
		if (!tablePlayer) throw new Error(`No table player found with user id ${ user_id }.`);
		return tablePlayer;
	},
	getTablePlayersByTableId: table_id => (
		db('table-players').select('in_table_room', 'position', 'table_chips', 'user_id').where({ table_id })
	),
	getTablePlayersOrderedByPosition: table_id => (
		db('table-players')
			.where({ table_id })
			.select('cards', 'end_action', 'position', 'table_chips')
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
	resetTablePlayer: (table_id, user_id) => (
		db('table-players')
			.update({ action: false, dealer_btn: false, end_action: false, position: 0 })
			.where({ table_id, user_id })
	),
	updateAction,
	updateCardsByPosition: (table_id, position, cards) => (
		db('table-players')
			.update({ cards: JSON.stringify(cards) })
			.where({ table_id, position })
			.returning('position')
	),
	updateDealerBtn,
	updateEndAction,
	updateInTableRoom: (table_id, user_id, in_table_room) => {
		// if player is re-joining table, also update the join date
		if (in_table_room) return db('table-players')
			.where({ table_id, user_id })
			.update({ in_table_room, join_date: db.fn.now() });
		// else just update in_table_room
		return db('table-players').where({ table_id, user_id }).update({ in_table_room });
	},
	updateTablePlayersForNewHand: async table_id => {
		const trx = await db.transaction();
		try {
			const tablePlayers = await trx('table-players')
				.where({ table_id })
				.select('action', 'dealer_btn', 'end_action', 'position');
			const prevActionPlayer = tablePlayers.find(p => p.action);
			// if action was previously on a player, reset the action for the new hand
			if (prevActionPlayer) await updateAction(table_id, null, trx);
			const prevEndActionPlayer = tablePlayers.find(p => p.end_action);
			// if end_action was previously on a player, reset end_action for the new hand
			if (prevEndActionPlayer) await updateEndAction(table_id, null, trx);
			const dealerBtnIdx = tablePlayers.findIndex(p => p.dealer_btn);
			// if there was previously a player OTB, give the btn to the next player
			if (dealerBtnIdx !== -1) {
				const tablePlayersLen = tablePlayers.length;
				const nextDealerBtnIdx = dealerBtnIdx === tablePlayersLen - 1 ? 0 : dealerBtnIdx + 1;
				const nextPlayerOnBtnPosition = tablePlayers[ nextDealerBtnIdx ].position;
				await updateDealerBtn(table_id, nextPlayerOnBtnPosition, trx);
				// if there are > 3 players in the hand, action will be 3 seats after next dealerBtn position
				let nextActionPlayer;
				if (tablePlayersLen > 3) {
					let actionIdx = nextDealerBtnIdx;
					let i = 3;
					while(i--) actionIdx = actionIdx === tablePlayersLen - 1 ? 0 : actionIdx + 1;
					nextActionPlayer = tablePlayers[ actionIdx ];
				// else action will be on next dealerBtn position
				} else nextActionPlayer = tablePlayers[ nextDealerBtnIdx ];
				if (!nextActionPlayer) throw new Error('Could not get next action player for new hand.');
				const nextActionPosition = nextActionPlayer.position;
				await updateAction(table_id, nextActionPosition, trx);
				await updateEndAction(table_id, nextActionPosition, trx);
			} else {
				// else, if there was no player OTB,
				// by default, give actions and dealerBtn to player in position 0
				await updateAction(table_id, 0, trx);
				await updateEndAction(table_id, 0, trx);
				await updateDealerBtn(table_id, 0, trx);
			}
			return trx.commit();
		} catch (e) {
			await trx.rollback();
			throw new Error(e);
		}
	},
};
