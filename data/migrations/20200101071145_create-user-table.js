const {
	constants,
}	= require('../../config/index.js');

const {
	users,
}	= constants;

exports.up = function(knex) {
	return knex.schema.createTable(users, function(table) {
		table
			.increments();

		table
			.integer('chips')
			.defaultsTo(3000)
			.notNullable();

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
	});
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists(users);
};
