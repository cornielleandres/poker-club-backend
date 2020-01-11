const {
	constants,
}	= require('../../config/index.js');

const {
	bigBlinds,
	gameTypes,
	initialCommunityCards,
	initialDeck,
	initialPot,
	maxPlayers,
	tableTypes,
} = constants;

exports.up = function(knex) {
	return knex.schema.createTable('tables', function(table) {
		table
			.increments();

		table
			.integer('big_blind') // even integer
			.defaultTo(bigBlinds[0])
			.notNullable();

		table
			.integer('call_amount')
			.defaultTo(0) // integer >= 0
			.notNullable();

		table
			.jsonb('community_cards')
			.defaultTo(JSON.stringify(initialCommunityCards))
			.notNullable();

		table
			.jsonb('deck')
			.defaultTo(JSON.stringify(initialDeck))
			.notNullable();

		table
			.string('game_type')
			.defaultTo(gameTypes[0]) // gameTypes[0] === NL Hold Em
			.notNullable();

		table
			.integer('hand_id')
			.defaultTo(0)
			.notNullable();

		table
			.integer('max_players')
			.defaultTo(maxPlayers[0])
			.notNullable();

		table
			.jsonb('pot')
			.defaultTo(JSON.stringify(initialPot))
			.notNullable();

		table
			.string('street')
			.defaultTo('')
			.notNullable();

		table
			.string('table_type')
			.defaultTo(tableTypes[0]) // tableTypes[0] === Normal
			.notNullable();
	});
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('tables');
};
