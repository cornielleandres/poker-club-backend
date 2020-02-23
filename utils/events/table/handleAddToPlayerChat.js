// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

module.exports = async (io, socket, message) => {
	const { handleError, handleTablePlayerPayloads }	= require('../../index.js');
	try {
		const { user_id } = socket;
		const { table_id } = await tablePlayerDb.getTablePlayerByUserId(user_id);
		const playerChatPayload = { type: 'player_chat', payload: { message, user_ids: [ user_id ] } };
		return handleTablePlayerPayloads(io, table_id, 'update_player_chat', null, null, playerChatPayload);
	} catch (e) {
		return handleError('Error sending player chat message.', e, socket);
	}
};
