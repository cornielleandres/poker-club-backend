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
	error_message,
	table_room,
	update_user_chips,
	usersKey,
}	= constants;

module.exports = async (io, table_id) => {
	try {
		const { handleTablePlayerPayloads, handleUpdateLobbyTables, redisClient }	= require('../../index.js');
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
					const newUserChips = (await userDb.updateUserChips(user_id, table_chips))[0];
					// if user is still connected, send them their updated user chips
					if (currSocketId) io.to(currSocketId).emit(update_user_chips, newUserChips);
				}
				// then remove them from the table
				await tablePlayerDb.deleteTablePlayer(table_id, user_id);
				removedPlayerPositions.push(position);
			}
		}
		// if there were removed players
		if (removedPlayerPositions.length) {
			// update the current table and the lobby tables to reflect the removed players
			await handleTablePlayerPayloads(io, table_id, 'player_removed', removedPlayerPositions);
			return handleUpdateLobbyTables(io);
		}
	} catch (e) {
		const errMsg = 'Remove Players: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
