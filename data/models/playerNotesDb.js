const db	= require('../dbConfig.js');

module.exports = {
	getAllPlayerNotes: user_ids => (
		db('player-notes')
			.select('user_id', 'player_notes_user_id', 'notes')
			.whereIn('user_id', user_ids)
			.whereIn('player_notes_user_id', user_ids)
	),
	updatePlayerNotes: (user_id, player_notes_user_id, notes) => {
		if (!notes) { // if no notes, delete the record
			return db('player-notes')
				.where({ user_id, player_notes_user_id })
				.del()
				.then(() => [{ player_notes_user_id }]);
		}
		return db('player-notes')
			.select('user_id')
			.where({ user_id, player_notes_user_id })
			.then(rows => {
				// if no notes found, insert new notes
				if (!rows.length) {
					return db('player-notes')
						.insert({ user_id, player_notes_user_id, notes })
						.returning([ 'player_notes_user_id', 'notes' ]);
				}
				// else if notes found, update the notes
				return db('player-notes')
					.update({ notes })
					.where({ user_id, player_notes_user_id })
					.returning([ 'player_notes_user_id', 'notes' ]);
			});
	},
};
