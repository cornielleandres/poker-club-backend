// config
const {
	constants,
}	= require('../../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../../data/models/index.js');

const {
	table_room,
}	= constants;

module.exports = async (io, table_id, players) => {
	const { handleError, handleTablePlayerPayloads }	= require('../../../index.js');
	try {
		for (const player of players) {
			const { handInfo, position, user_id } = player;
			await tablePlayerDb.updateHandDescription(table_id, user_id, handInfo.description);
			await handleTablePlayerPayloads(io, table_id, 'hand_description', [ position ], 2000);
		}
	} catch (e) {
		return handleError('Error updating hand descriptions.', e, null, io, table_room + table_id);
	}
};
