// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
	table_room,
	usersKey,
}	= constants;

module.exports = (io, table_id) => {
	const { handleDefaultAction, redisClient } = require('../../index.js');
	return io.in(table_room + table_id).clients(async (err, clients) => {
		if (err) {
			const errMsg = 'Check Next Player Disconnect Error: ' + err.toString();
			console.log(errMsg);
			return io.in(table_room + table_id).emit(error_message, errMsg);
		}
		const actionPlayer = await tablePlayerDb.getActionPlayerByTableId(table_id);
		if (!actionPlayer) {
			const errMsg = 'Check Next Player Disconnect Error: No action player found.';
			console.log(errMsg);
			return io.in(table_room + table_id).emit(error_message, errMsg);
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
