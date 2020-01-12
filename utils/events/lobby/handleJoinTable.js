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

module.exports = async (socket, table_id, callback) => {
	try {
		const user_chips = await tablePlayerDb.joinTable(table_id, socket.user_id);
		callback(user_chips);
	} catch (e) {
		const errMsg = 'Join Table: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
