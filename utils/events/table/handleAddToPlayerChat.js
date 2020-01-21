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
}	= constants;

module.exports = async (io, socket, message, callback) => {
	try {
		const { handleTablePlayerPayloads }	= require('../../index.js');
		const { user_id } = socket;
		const { table_id } = await tablePlayerDb.getTablePlayerByUserId(user_id);
		callback();
		return handleTablePlayerPayloads(io, table_id, 'update_player_chat', null, null, { message, user_id });
	} catch (e) {
		const errMsg = 'Player Chat Error: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};