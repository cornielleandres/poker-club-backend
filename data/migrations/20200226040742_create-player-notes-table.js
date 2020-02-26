exports.up = function(knex) {
	return knex.schema.createTable('player-notes', function(table) {
		table
			.increments();

		table
			.integer('user_id')
			.references('id')
			.inTable('users')
			.notNullable()
			.onDelete('CASCADE');

		table
			.integer('player_notes_user_id')
			.references('id')
			.inTable('users')
			.notNullable()
			.onDelete('CASCADE');

		table
			.string('notes', 1000);
	});
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('player-notes');
};
