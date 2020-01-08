const _	= require('lodash');

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
	error_message,
	gameTypes,
	lobby_room,
	table_room,
	update_lobby_tables,
}	= constants;

module.exports = async (io, socket, table_id, callback) => {
	try {
		const joinedPlayerUserId = socket.user_id;
		const { isNonEmptyObject } = require('../../index.js');
		const user_chips = await tablePlayerDb.joinTable(table_id, joinedPlayerUserId);
		callback(user_chips);
		const tables = await tableDb.getLobbyTables();
		socket.to(lobby_room).emit(update_lobby_tables, tables);
		const table = await tableDb.getTable(table_id);
		const { position } = table.players.find(p => p && p.user_id === joinedPlayerUserId);
		const hiddenCards = table.game_type === gameTypes[1] // gameTypes[1] === PL Omaha
			? [ { rank: 0 }, { rank: 0 }, { rank: 0 }, { rank: 0 } ]
			: [ { rank: 0 }, { rank: 0 } ];
		return io.in(table_room + table_id).clients(async (err, clients) => {
			if (err) return io.in(table_room + table_id).emit(error_message, err.toString());
			try {
				const clientsAndPayloads = [];
				clients.forEach(client => {
					const { user_id } = io.sockets.connected[ client ];
					const clientTable = _.cloneDeep(table);
					const { players } = clientTable;
					const playerIndex = players.findIndex(p => p && p.user_id === user_id);
					clientTable.players = players.slice(playerIndex).concat(players.slice(0, playerIndex))
						.map(p => {
							// if another player has cards (i.e., they are currently in a hand)
							if (p && p.user_id !== user_id && p.cards.length && isNonEmptyObject(p.cards[0])) {
								// show their cards as hidden
								p.cards = hiddenCards;
							}
							return p;
						});
					const payload = { position, table: clientTable };
					clientsAndPayloads.push({ client, payload });
				});
				clientsAndPayloads.forEach(c => io.to(c.client).emit('player_joined', c.payload));
			} catch (e) {
				const errMsg = 'Table Clients And Payloads on Player Join Error: ' + e.toString();
				return io.in(table_room + table_id).emit(error_message, errMsg);
			}
		});
	} catch (e) {
		const errMsg = 'Player Joins Table Error: ' + e.toString();
		return socket.emit(error_message, errMsg);
	}
};
