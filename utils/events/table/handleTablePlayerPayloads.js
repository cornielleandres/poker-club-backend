const _	= require('lodash');

// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tableDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
	gameTypes,
	table_room,
}	= constants;

module.exports = async (io, table_id, event_name, positions, delayTime, chatMessagePayload) => {
	try {
		const { delay, isNonEmptyObject }	= require('../../index.js');
		let table;
		let hiddenCards;
		// if sending a chat message, there is no need to get the table
		if (!chatMessagePayload) {
			table = await tableDb.getTable(table_id);
			const { game_type } = table;
			hiddenCards = game_type === gameTypes[1] // gameTypes[1] === PL Omaha
				? [ { rank: 0 }, { rank: 0 }, { rank: 0 }, { rank: 0 } ]
				: [ { rank: 0 }, { rank: 0 } ];
		}
		io.in(table_room + table_id).clients((err, clients) => {
			if (err) return io.in(table_room + table_id).emit(error_message, err.toString());
			try {
				const clientsAndPayloads = [];
				clients.forEach(client => {
					const clientSocket = io.sockets.connected[ client ];
					if (clientSocket) { // if client is still connected
						// if sending a chat message, just push the payload to the array
						if (chatMessagePayload) return clientsAndPayloads.push({ client, payload: chatMessagePayload });
						const { user_id } = clientSocket;
						const clientTable = _.cloneDeep(table);
						const { players } = clientTable;
						const playerIndex = players.findIndex(p => p && p.user_id === user_id);
						clientTable.players = players.slice(playerIndex).concat(players.slice(0, playerIndex))
							.map(p => {
								// if the following conditions are met, hide the player's cards in the payload
								if (
									p // is a player
									&& p.user_id !== user_id // is not the client player
									&& p.cards.length // has not folded
									&& isNonEmptyObject(p.cards[0]) // is currently in the hand
									&& p.hide_cards // is set to hide their cards
								) p.cards = hiddenCards;
								return p;
							});
						const payload = { positions, table: clientTable };
						clientsAndPayloads.push({ client, payload });
					}
				});
				clientsAndPayloads.forEach(c => io.to(c.client).emit(event_name, c.payload));
			} catch (e) {
				const errMsg = 'Table Clients And Payloads for Event: "' + event_name + '": ' + e.toString();
				console.log(errMsg);
				return io.in(table_room + table_id).emit(error_message, errMsg);
			}
		});
		if (delayTime) return delay(delayTime);
	} catch (e) {
		const errMsg = 'Table Player Payloads for Event: "' + event_name + '": ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
