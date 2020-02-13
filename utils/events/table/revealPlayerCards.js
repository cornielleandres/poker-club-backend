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
	gameTypes,
	table_room,
	update_action_chat,
}	= constants;

module.exports = async (io, table_id, playerCardsToReveal, game_type) => {
	try {
		const { handleTablePlayerPayloads }	= require('../../index.js');
		const omaha = game_type === gameTypes[1];
		const delayTime = omaha ? 4000 : 2000;
		for (const player of playerCardsToReveal) {
			const { cards, position, user_id } = player;
			await tablePlayerDb.updateHideCards(table_id, user_id, false);
			const actionChatPayload = { type: 'shown_player_cards', payload: { cards, user_ids: [ user_id ] } };
			await handleTablePlayerPayloads(io, table_id, 'reveal_player_cards', [ position ], delayTime);
			await handleTablePlayerPayloads(io, table_id, update_action_chat, null, null, actionChatPayload);
		}
	} catch (e) {
		const errMsg = 'Reveal Player Cards Error: ' + e.toString();
		console.log(errMsg);
		return io.in(table_room + table_id).emit(error_message, errMsg);
	}
};
