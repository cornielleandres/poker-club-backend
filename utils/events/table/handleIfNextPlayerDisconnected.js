// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	table_room,
	usersKey,
}	= constants;

module.exports = (io, table_id) => {
	const { handleDefaultAction, handleError, redisClient } = require('../../index.js');
	return io.in(table_room + table_id).clients(async (err, clients) => {
		if (err) {
			const errMsgDescription = 'Error checking if next player is connected.';
			return handleError(errMsgDescription, err, null, io, table_room + table_id);
		}
		const actionPlayer = await tablePlayerDb.getActionPlayerByTableId(table_id);
		if (!actionPlayer) {
			const errMsgDescription = 'Error checking for next player. No action player found.';
			return handleError(errMsgDescription, null, null, io, table_room + table_id);
		}
		const { bet, user_id } = actionPlayer;
		const redisClientKey = usersKey + user_id;
		const nexActionSocketId = await redisClient.getAsync(redisClientKey);
		// if the next action player is not currently connected to the table room
		if (!clients.includes(nexActionSocketId)) {
			const nexActionSocket = io.sockets.connected[ nexActionSocketId ];
			return handleDefaultAction(io, nexActionSocket, table_id, user_id, bet);
		}
	});
};
