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
	remove_card,
	reset_discard_timer_end,
	table_room,
}	= constants;

module.exports = async (io, socket, cardIndex, callback) => {
	const {
		handleTablePlayerPayloads,
	}	= require('../../index.js');
	let table_id;
	try {
		const { user_id } = socket;
		const tablePlayer = await tablePlayerDb.getTablePlayerByUserId(user_id);
		table_id = tablePlayer.table_id;
		const { cards, position } = tablePlayer;
		const positions = [ position ];
		await tablePlayerDb.resetDiscardTimerEnd(table_id, positions);
		await handleTablePlayerPayloads(io, table_id, reset_discard_timer_end, positions);
		cards.splice(cardIndex, 1);
		await tablePlayerDb.updateCardsByPosition(table_id, position, cards);
		await handleTablePlayerPayloads(io, table_id, remove_card);
		return callback();
	} catch (e) {
		const errMsg = 'Player Discards Error: ' + e.toString();
		console.log(errMsg);
		if (table_id) return io.in(table_room + table_id).emit(error_message, errMsg);
		return socket.emit(error_message, errMsg);
	}
};
