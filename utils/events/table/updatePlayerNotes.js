// databases
const {
	playerNotesDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, newNotes, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const { user_id } = socket;
		const { notes, player_notes_user_id } = newNotes;
		const updatedNotes = (await playerNotesDb.updatePlayerNotes(user_id, player_notes_user_id, notes))[0];
		return callback(updatedNotes);
	} catch (e) {
		return handleError('Error updating player notes.', e, socket);
	}
};
