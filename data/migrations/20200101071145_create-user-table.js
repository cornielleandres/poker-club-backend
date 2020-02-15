exports.up = function(knex) {
	return knex.schema.createTable('users', function(table) {
		table
			.increments();

		table
			.binary('avatar');

		table
			.boolean('claimed_daily_chips')
			.defaultTo(false)
			.notNullable();

		table
			.boolean('dark_mode')
			.defaultTo(false)
			.notNullable();

		table
			.integer('default_avatar_id')
			.references('id')
			.inTable('default-avatars')
			.onDelete('SET NULL');

		table
			.string('email')
			.notNullable()
			.unique()
			.index();

		table
			.string('name')
			.notNullable();

		table
			.text('picture');

		table
			.integer('user_chips')
			.defaultsTo(3000)
			.notNullable();
	});
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('users');
};
