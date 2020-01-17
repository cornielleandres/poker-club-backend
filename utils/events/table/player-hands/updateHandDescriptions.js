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
			const { hand, position, user_id } = player;
			const hand_description = hand.description;
			await tablePlayerDb.updateHandDescription(table_id, user_id, hand_description);
			await handleTablePlayerPayloads(io, table_id, 'hand_description', [ position ], 2000);
		}
	} catch (e) {
		const errMsg = 'Update Hand Descriptions Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
