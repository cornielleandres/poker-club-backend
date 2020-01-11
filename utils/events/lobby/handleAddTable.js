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
}	= constants;

module.exports = async (socket, table, callback) => {
	try {
		const { handleUpdateLobbyTables }	= require('../../index.js');
		const table_id = (await tableDb.addTable(table))[0];
		callback(table_id);
		return handleUpdateLobbyTables(null, socket, null);
	} catch (e) {
		const errMsg = 'Add Table' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
