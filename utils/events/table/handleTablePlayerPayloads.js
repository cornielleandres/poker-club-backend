const _	= require('lodash');

// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	error_message,
	gameTypes,
	table_room,
}	= constants;

module.exports = (io, table, event_name, position) => {
	const table_id = table.id;
	try {
		const { isNonEmptyObject }	= require('../../index.js');
		const { game_type } = table;
		const hiddenCards = game_type === gameTypes[1] // gameTypes[1] === PL Omaha
			? [ { rank: 0 }, { rank: 0 }, { rank: 0 }, { rank: 0 } ]
			: [ { rank: 0 }, { rank: 0 } ];
		return io.in(table_room + table_id).clients((err, clients) => {
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
				clientsAndPayloads.forEach(c => io.to(c.client).emit(event_name, c.payload));
			} catch (e) {
				const errMsg = 'Table Clients And Payloads' + e.toString();
				console.log(errMsg);
				return io.in(table_room + table_id).emit(error_message, errMsg);
			}
		});
	} catch (e) {
		const errMsg = 'Table Player Payloads' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};