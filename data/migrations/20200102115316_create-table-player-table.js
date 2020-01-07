exports.up = async (knex) => {
	try {
		await knex.schema.createTable('table-players', function(table) {
			table
				.increments();

			table
				.integer('table_id')
				.references('id')
				.inTable('tables')
				.notNullable()
				.onDelete('CASCADE');

			table
				.integer('user_id')
				.references('id')
				.inTable('users')
				.notNullable()
				.onDelete('NO ACTION');

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
				.boolean('action')
				.defaultTo(false)
				.notNullable();

			table
				.boolean('end_action')
				.defaultTo(false)
				.notNullable();

			table
				.integer('position')
				.notNullable();

			table
				.integer('table_chips')
				.defaultsTo(0)
				.notNullable();

			table
				.datetime('timer_end')
				.defaultTo(null);

			table
				.unique([ 'table_id', 'user_id' ]);

			table
				.unique([ 'table_id', 'position' ]);
		});
		await knex.schema
			.raw('CREATE UNIQUE INDEX ON "table-players" (table_id, dealer_btn) WHERE dealer_btn = true');
		await knex.schema
			.raw('CREATE UNIQUE INDEX ON "table-players" (table_id, action) WHERE action = true');
		await knex.schema
			.raw('CREATE UNIQUE INDEX ON "table-players" (table_id, end_action) WHERE end_action = true');
		return knex.schema
			.raw('CREATE UNIQUE INDEX ON "table-players" (table_id, timer_end) WHERE timer_end IS NOT NULL');
	} catch (e) {
		console.log('Knex migration error:', e);
	}
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('table-players');
};
