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
	update_actions,
}	= constants;

module.exports = async (io, table_id, action, table_type, street, hand_id) => {
	try {
		const { handlePlayerTimer, handleTablePlayerPayloads }	= require('../../index.js');
		await tablePlayerDb.updateAction(table_id, action);
		await handleTablePlayerPayloads(io, table_id, update_actions, null, 2000);
		return handlePlayerTimer(io, table_id, table_type, action, street, hand_id);
	} catch(e) {
		const errMsg = 'Update Action And Timer Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
