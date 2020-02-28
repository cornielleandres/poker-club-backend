exports.up = async knex => {
	await knex.schema.createTable('player-notes', function(table) {
		table
			.increments();

		table
			.integer('user_id')
			.references('id')
			.inTable('users')
			.notNullable()
			.onDelete('CASCADE')
			.index();

		table
			.integer('player_notes_user_id')
			.references('id')
			.inTable('users')
			.notNullable()
			.onDelete('CASCADE')
			.index();

		table
			.string('notes', 1000);
	});
	return knex.schema.raw('CREATE UNIQUE INDEX ON "player-notes" (user_id, player_notes_user_id)');
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('player-notes');
};
