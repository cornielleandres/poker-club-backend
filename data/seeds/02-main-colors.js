exports.seed = function(knex) {
	// Deletes ALL existing entries
	return knex('main-colors').del()
		.then(function () {
		// Inserts seed entries
			return knex('main-colors').insert([
				{ dark: '#2e7d32', light: '#69f0ae', main: '#00e676' }, // green
				{ dark: '#6a1b9a', light: '#e040fb', main: '#d500f9' }, // purple
				{ dark: '#c62828', light: '#ff5252', main: '#ff1744' }, // red
			]);
		});
};
