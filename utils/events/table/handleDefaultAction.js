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
	table_room,
}	= constants;

module.exports = async (io, socket, table_id, user_id, bet) => {
	const { handlePlayerChecks, handlePlayerFolds }	= require('../../index.js');
	try {
		const { call_amount } = await tableDb.getCallAmountByTableId(table_id);
		// if player's bet is equal to the call_amount, player is forced to check
		if (bet === call_amount) return handlePlayerChecks(io, socket, user_id);
		// else player is forced to fold
		return handlePlayerFolds(io, socket, user_id);
	} catch (e) {
		const errMsg = 'Default Action Error: ' + e.toString();
		console.log(errMsg);
		if (table_id) return io.in(table_room + table_id).emit(error_message, errMsg);
		if (socket) return socket.emit(error_message, errMsg);
	}
};
