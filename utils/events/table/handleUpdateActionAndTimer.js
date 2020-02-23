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
	update_actions,
}	= constants;

module.exports = async (io, table_id, action, table_type, street, hand_id) => {
	const { handleError, handlePlayerTimer, handleTablePlayerPayloads }	= require('../../index.js');
	try {
		await tablePlayerDb.updateAction(table_id, action);
		await handleTablePlayerPayloads(io, table_id, update_actions, null, 2000);
		return handlePlayerTimer(io, table_id, table_type, action, street, hand_id);
	} catch(e) {
		return handleError('Error updating action and player timer.', e, null, io, table_room + table_id);
	}
};
