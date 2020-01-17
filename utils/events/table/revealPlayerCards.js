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
}	= constants;

module.exports = async (io, table_id, playerCardsToReveal, omaha) => {
	try {
		const { handleTablePlayerPayloads }	= require('../../index.js');
		const delayTime = omaha ? 4000 : 2000;
		for (const player of playerCardsToReveal) {
			await tablePlayerDb.updateHideCards(table_id, player.user_id, false);
			await handleTablePlayerPayloads(io, table_id, 'reveal_player_cards', [ player.position ], delayTime);
		}
	} catch (e) {
		const errMsg = 'Reveal Player Cards Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
