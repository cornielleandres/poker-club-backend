module.exports = {
	// default and initial values
	bigBlinds: [ 10, 20, 40, 80, 100 ],
	defaultBigBlind: 10,
	defaultMaxPlayers: 6,
	defaultPot: [ { amount: 0, user_ids: [] } ],
	gameTypes: [ 'NL Hold Em', 'PL Omaha' ],
	initialCommunityCards: [ {}, {}, {}, {}, {} ],
	maxPlayers: [ 6, 5, 4, 3, 2 ],
	tableTypes: [ 'Normal', 'Turbo' ],
	totalTimeNormal: 30000,
	totalTimeTurbo: 15000,

	// event names
	update_lobby_tables: 'update_lobby_tables',

	// room names
	lobby_room: 'lobby_room',

	// misc
	error_message: 'error_message',
	usersKey: 'users:',
};
