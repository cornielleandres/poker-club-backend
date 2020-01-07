exports.up = function(knex) {
	return knex.schema.createTable('users', function(table) {
		table
			.increments();

		table
			.string('email')
			.notNullable()
			.unique()
			.index();

		table
			.string('name')
			.notNullable();

		table
			.string('picture');

		table
			.integer('user_chips')
			.defaultsTo(3000)
			.notNullable();
	});
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('users');
};
