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
	table_room,
	tableTypes,
	totalTimeNormal,
	totalTimeTurbo,
	usersKey,
}	= constants;

module.exports = async (io, table_id, table_type, action, street, hand_id) => {
	const { handleDefaultAction, handleTablePlayerPayloads, redisClient } = require('../../index.js');
	let total_time = totalTimeNormal;
	if (table_type !== tableTypes[0]) total_time = totalTimeTurbo; // tableTypes[0] === Normal
	const newTimerEnd = new Date();
	newTimerEnd.setMilliseconds(newTimerEnd.getMilliseconds() + total_time);
	await tablePlayerDb.updateTimerEnd(table_id, action, newTimerEnd);
	await handleTablePlayerPayloads(io, table_id, 'update_player_timer', [ action ]);
	return setTimeout(async () => {
		try {
			const currentTable = await tableDb.getStreetAndHandId(table_id);
			const { bet, position, user_id } = await tablePlayerDb.getActionPlayerByTableId(table_id);
			// if these conditions are satisfied, it means player did not act in time
			if (
				action === position
				&& street === currentTable.street
				&& hand_id === currentTable.hand_id
			) {
				const redisClientKey = usersKey + user_id;
				const playerSocketId = await redisClient.getAsync(redisClientKey);
				const playerSocket = io.sockets.connected[ playerSocketId ];
				return handleDefaultAction(io, playerSocket, table_id, user_id, bet);
			}
		} catch (e) {
			const errMsg = 'Player Timer Error: ' + e.toString();
			console.log(errMsg);
			return io.in(table_room + table_id).emit(error_message, errMsg);
		}
	}, total_time);
};
