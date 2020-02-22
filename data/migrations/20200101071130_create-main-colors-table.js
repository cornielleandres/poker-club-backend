exports.up = function(knex) {
	return knex.schema.createTable('main-colors', function(table) {
		table
			.increments();

		table
			.string('dark')
			.notNullable();

		table
			.string('light')
			.notNullable();

		table
			.string('main')
			.notNullable();
	});
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('main-colors');
};
