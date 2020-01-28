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
	tableTypes,
	totalTimeNormal,
	totalTimeTurbo,
}	= constants;

module.exports = async (
	io,
	table_id,
	table_type,
	playersWithCards,
	updateStreetCardsTimerAndActions,
) => {
	const { handleTablePlayerPayloads, isNonEmptyObject } = require('../../index.js');
	let total_time = totalTimeNormal;
	if (table_type !== tableTypes[0]) total_time = totalTimeTurbo; // tableTypes[0] === Normal
	const positions = playersWithCards.map(p => p.position);
	const newDiscardTimerEnd = new Date();
	newDiscardTimerEnd.setMilliseconds(newDiscardTimerEnd.getMilliseconds() + total_time);
	await tablePlayerDb.updateDiscardTimerEnd(table_id, positions, newDiscardTimerEnd);
	const setTimeoutTimer = 2000;
	let numOfTimeouts = 0;
	const discardTimeout = () => setTimeout(async () => {
		try {
			const players = await tablePlayerDb.getPlayerCardsAndPositionsByTableId(table_id);
			// filter out the players with cards in front of them (are still in the hand)
			const playersNotDiscarded = players.filter(p => p.cards.length > 2 && isNonEmptyObject(p.cards[0]));
			// if there is noone who has not discarded, continue the hand as normal
			if (!playersNotDiscarded.length) return updateStreetCardsTimerAndActions();
			// if at least one player has not discarded and the time for them to do so is up
			if (setTimeoutTimer * numOfTimeouts++ >= total_time) {
				// force the remaining players who have not done so to discard their last card
				const positions = playersNotDiscarded.map(p => p.position);
				await tablePlayerDb.resetDiscardTimerEnd(table_id, positions);
				await handleTablePlayerPayloads(io, table_id, reset_discard_timer_end);
				for await (const player of playersNotDiscarded) {
					player.cards.splice(2, 1);
					await tablePlayerDb.updateCardsByPosition(table_id, player.position, player.cards);
				}
				await handleTablePlayerPayloads(io, table_id, remove_card, positions);
				// then continue the hand as normal
				return updateStreetCardsTimerAndActions();
			}
			// if at least one player has not discarded BUT the time for them to do so is NOT up,
			// set another timeout
			return discardTimeout();
		} catch (e) {
			const errMsg = 'Discard Timer Error: ' + e.toString();
			console.log(errMsg);
			return io.in(table_room + table_id).emit(error_message, errMsg);
		}
	}, setTimeoutTimer);
	await handleTablePlayerPayloads(io, table_id, 'update_discard_timer', positions, 5000);
	return discardTimeout();
};
