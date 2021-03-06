// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tableDb,
	tablePlayerDb,
	userDb,
}	= require('../../../data/models/index.js');

const {
	player_removal,
	table_room,
	update_action_chat,
	update_user_chips,
	usersKey,
}	= constants;

module.exports = async (io, table_id) => {
	const {
		handleError,
		handleTablePlayerPayloads,
		handleUpdateLobbyTables,
		redisClient,
	}	= require('../../index.js');
	try {
		const tablePlayers = await tablePlayerDb.getTablePlayersByTableId(table_id);
		const tablePlayersLen = tablePlayers.length;	
		const tableRoom = io.sockets.adapter.rooms[table_room + table_id];
		// if no table room, it means everyone disconnected/left the room, which automatically deletes the room.
		// this, consequently, also means the table is empty.
		if (!tableRoom) {
			// for each player that was at the table, add their remaining table chips to their user chips
			for (let i = 0; i < tablePlayersLen; i++) {
				const { user_id, table_chips } = tablePlayers[i];
				const newUserChips = (await userDb.addToUserChips(user_id, table_chips))[0];
				const redisClientKey = usersKey + user_id;
				const currSocketId = await redisClient.getAsync(redisClientKey);
				// if user is still connected, send them their updated user chips
				if (currSocketId) io.to(currSocketId).emit(update_user_chips, newUserChips);
			}
			// then delete the table
			await tableDb.deleteTable(table_id);
			// then update the lobby tables to reflect this deleted table
			return handleUpdateLobbyTables(io);
		}
		const removedPlayerPositions = [];
		// else if there is a table room,
		// check to see which players are still connected to the table room and have table chips remaining
		const tableRoomSockets = tableRoom.sockets;
		const tableRoomClients = Object.keys(tableRoomSockets);
		for (let i = 0; i < tablePlayersLen; i++) {
			const { position, user_id, table_chips } = tablePlayers[i];
			const redisClientKey = usersKey + user_id;
			const currSocketId = await redisClient.getAsync(redisClientKey);
			// if the table player is not currently connected to the table room
			// or if they have no table chips left
			if (!tableRoomClients.includes(currSocketId) || !table_chips) {
				// if they still have table chips, add their remaining table chips to their user chips
				if (table_chips) {
					const newUserChips = (await userDb.addToUserChips(user_id, table_chips))[0];
					// if user is still connected, send them their updated user chips
					if (currSocketId) io.to(currSocketId).emit(update_user_chips, newUserChips);
				// else if they do not have any table chips left
				} else io.to(currSocketId).emit('no_table_chips');
				// then remove them from the table
				await tablePlayerDb.deleteTablePlayer(table_id, user_id);
				removedPlayerPositions.push(position);
			}
		}
		// if there were removed players
		if (removedPlayerPositions.length) {
			for (const position of removedPlayerPositions) {
				const { name } = tablePlayers.find(p => p.position === position);
				const actionChatPayload = {
					type: player_removal,
					payload: { description: 'got removed', playerNames: [ name ] },
				};
				await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
			}
			// update the current table and the lobby tables to reflect the removed players
			await handleTablePlayerPayloads(io, table_id, 'player_removed', removedPlayerPositions, 1000);
			return handleUpdateLobbyTables(io);
		}
	} catch (e) {
		return handleError('Error removing players from table.', e, null, io, table_room + table_id);
	}
};
