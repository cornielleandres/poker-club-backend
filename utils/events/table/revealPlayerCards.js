// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

const {
	gameTypes,
	table_room,
	update_action_chat,
}	= constants;

module.exports = async (io, table_id, playerCardsToReveal, game_type) => {
	const { handleError, handleTablePlayerPayloads }	= require('../../index.js');
	try {
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
		return handleError('Error revealing player cards.', e, null, io, table_room + table_id);
	}
};
