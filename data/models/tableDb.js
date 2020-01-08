const db	= require('../dbConfig.js');

// config
const {
	constants,
}	= require('../../config/index.js');

const {
	bigBlinds,
	gameTypes,
	maxPlayers,
	tableTypes,
	totalTimeNormal,
	totalTimeTurbo,
} = constants;

module.exports = {
	addTable: table => {
		const { big_blind, game_type, max_players, table_type } = table;
		if (!bigBlinds.includes(big_blind)) throw new Error(`Big blind "${ big_blind }" not allowed.`);
		if (!gameTypes.includes(game_type)) throw new Error(`Game type "${ game_type }" not allowed.`);
		if (!maxPlayers.includes(max_players)) throw new Error(`Max players "${ max_players }" not allowed.`);
		if (!tableTypes.includes(table_type)) throw new Error(`Table type ${ table_type } not allowed.`);
		return db('tables').insert(table).returning('id');
	},
	getLobbyTables: async () => {
		let lobbyTables = await db('tables')
			.select('id', 'big_blind', 'game_type', 'max_players', 'table_type')
			.orderBy('id');
		const lobbyTableIds = lobbyTables.map(table => table.id);
		const lobbyTablePlayers = await db('table-players as tp')
			.select('tp.table_id', 'tp.user_id', 'u.picture', 'tp.position')
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
		const table = await db('tables').where({ id }).first();
		if (!table) throw new Error('This table does not exist.');
		const tablePlayers = await db('table-players as tp')
			.where({ table_id: id })
			.select(
				'tp.bet',
				'tp.action',
				'tp.cards',
				'tp.end_action',
				'tp.dealer_btn',
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
};
