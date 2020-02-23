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
	table_room,
}	= constants;

module.exports = async (io, table_id, event_name, positions, delayTime, chatMessagePayload) => {
	const { delay, handleError, isNonEmptyObject }	= require('../../index.js');
	try {
		const table = await tableDb.getTable(table_id);
		io.in(table_room + table_id).clients((err, clients) => {
			try {
				if (err) throw new Error(err);
				const clientsAndPayloads = [];
				clients.forEach(client => {
					const clientSocket = io.sockets.connected[ client ];
					if (clientSocket) { // if client is still connected
						const { user_id: clientUserId } = clientSocket;
						if (chatMessagePayload) { // if sending a chat message
							let payload = chatMessagePayload;
							if (chatMessagePayload.payload.user_ids) {
								payload = _.cloneDeep(chatMessagePayload);
								payload.payload.playerNames = payload.payload.user_ids.map(user_id => {
									if (user_id === clientUserId) return 0; // 0 is used to indicate the client itself
									const player = table.players.find(p => p && p.user_id === user_id);
									if (!player) return null;
									return player.name;
								});
								delete payload.payload.user_ids;
							}
							return clientsAndPayloads.push({ client, payload });
						}
						const clientTable = _.cloneDeep(table);
						const { players } = clientTable;
						const playerIndex = players.findIndex(p => p && p.user_id === clientUserId);
						clientTable.players = players.slice(playerIndex).concat(players.slice(0, playerIndex))
							.map(p => {
								// if the following conditions are met, hide the player's cards in the payload
								if (
									p // is a player
									&& p.user_id !== clientUserId // is not the client player
									&& p.cards.length // has not folded
									&& isNonEmptyObject(p.cards[0]) // is currently in the hand
									&& p.hide_cards // is set to hide their cards
								) p.cards = p.cards.map(() => ({ rank: 0 })); // map to hidden cards
								return p;
							});
						const payload = { positions, table: clientTable };
						clientsAndPayloads.push({ client, payload });
					}
				});
				clientsAndPayloads.forEach(c => io.to(c.client).emit(event_name, c.payload));
			} catch (e) {
				const err = `Error for event "${ event_name }": ${ e }`;
				return handleError('Error sending data to table players.', err, null, io, table_room + table_id);
			}
		});
		if (delayTime) return delay(delayTime);
	} catch (e) {
		const err = `Error for event "${ event_name }": ${ e }`;
		return handleError('Error getting table player clients.', err, null, io, table_room + table_id);
	}
};
