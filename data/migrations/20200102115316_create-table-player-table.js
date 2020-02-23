exports.up = async (knex) => {
	await knex.schema.createTable('table-players', function(table) {
		table
			.increments();

		table
			.boolean('action')
			.defaultTo(false)
			.notNullable();

		table
			.integer('bet')
			.defaultsTo(0)
			.notNullable();

		table
			.jsonb('cards')
			.defaultTo(JSON.stringify([ {}, {} ]))
			.notNullable();

		table
			.boolean('dealer_btn')
			.defaultTo(false)
			.notNullable();

		table
			.datetime('discard_timer_end')
			.defaultTo(null);

		table
			.boolean('end_action')
			.defaultTo(false)
			.notNullable();

		table
			.string('hand_description')
			.defaultTo('')
			.notNullable();

		table
			.boolean('hide_cards')
			.defaultTo(true);

		table
			.boolean('in_table_room')
			.defaultTo(true)
			.notNullable();

		table
			.datetime('join_date')
			.defaultTo(knex.fn.now());

		table
			.integer('position')
			.notNullable();

		table
			.integer('table_chips')
			.defaultsTo(0)
			.notNullable();

		table
			.integer('table_id')
			.references('id')
			.inTable('tables')
			.notNullable()
			.onDelete('CASCADE');

		table
			.datetime('timer_end')
			.defaultTo(null);

		table
			.integer('user_id')
			.references('id')
			.inTable('users')
			.notNullable()
			.onDelete('NO ACTION');

		table
			.unique([ 'table_id', 'position' ]);

		table
			.unique([ 'table_id', 'user_id' ]);
	});
	await knex.schema
		.raw('CREATE UNIQUE INDEX ON "table-players" (table_id, action) WHERE action = true');
	await knex.schema
		.raw('CREATE UNIQUE INDEX ON "table-players" (table_id, dealer_btn) WHERE dealer_btn = true');
	await knex.schema
		.raw('CREATE UNIQUE INDEX ON "table-players" (table_id, end_action) WHERE end_action = true');
	await knex.schema
		.raw('CREATE UNIQUE INDEX ON "table-players" (user_id, in_table_room) WHERE in_table_room = true');
	return knex.schema
		.raw('CREATE UNIQUE INDEX ON "table-players" (table_id, timer_end) WHERE timer_end IS NOT NULL');
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('table-players');
};
