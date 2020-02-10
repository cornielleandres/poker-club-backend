exports.up = function(knex) {
	return knex.schema.createTable('default-avatars', function(table) {
		table
			.increments();

		table
			.binary('default_avatar');
	});
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('default-avatars');
};
