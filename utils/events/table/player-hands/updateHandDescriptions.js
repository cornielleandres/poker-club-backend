// config
const {
	constants,
}	= require('../../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../../data/models/index.js');

const {
	error_message,
	table_room,
}	= constants;

module.exports = async (io, table_id, players) => {
	try {
		const { handleTablePlayerPayloads }	= require('../../../index.js');
		for (const player of players) {
			const { handInfo, position, user_id } = player;
			await tablePlayerDb.updateHandDescription(table_id, user_id, handInfo.description);
			await handleTablePlayerPayloads(io, table_id, 'hand_description', [ position ], 2000);
		}
	} catch (e) {
		const errMsg = 'Update Hand Descriptions Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
