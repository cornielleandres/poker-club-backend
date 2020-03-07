exports.seed = function(knex) {
	// Deletes ALL existing entries
	return knex('main-colors').del()
		.then(function () {
		// Inserts seed entries
			return knex('main-colors').insert([
				// dark: 800, light: A200, main: A400 in material UI
				{ dark: '#6a1b9a', light: '#e040fb', main: '#d500f9' }, // purple
				{ dark: '#c62828', light: '#ff5252', main: '#ff1744' }, // red
				{ dark: '#ef6c00', light: '#ffab40', main: '#ff9100' }, // orange
				{ dark: '#2e7d32', light: '#69f0ae', main: '#00e676' }, // green
				{ dark: '#1565c0', light: '#448aff', main: '#2979ff' }, // blue
				{ dark: '#ad1457', light: '#ff4081', main: '#f50057' }, // pink
			]);
		});
};
