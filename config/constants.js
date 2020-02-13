const c = 'club';
const d = 'diamond';
const h = 'heart';
const s = 'spade';

module.exports = {
	// default and initial values
	bigBlinds: [ 10, 20, 40, 80, 100 ],
	gameTypes: [ 'NL Hold Em', 'PL Omaha', 'Crazy Pineapple' ],
	initialCommunityCards: [ {}, {}, {}, {}, {} ],
	initialDeck: [
		{ rank: 2, suit: c },	{ rank: 3, suit: c },	{ rank: 4, suit: c },	{ rank: 5, suit: c },
		{ rank: 6, suit: c },	{ rank: 7, suit: c },	{ rank: 8, suit: c },	{ rank: 9, suit: c },
		{ rank: 10, suit: c },	{ rank: 11, suit: c },	{ rank: 12, suit: c },	{ rank: 13, suit: c },
		{ rank: 14, suit: c },
	
		{ rank: 2, suit: d },	{ rank: 3, suit: d },	{ rank: 4, suit: d },	{ rank: 5, suit: d },
		{ rank: 6, suit: d },	{ rank: 7, suit: d },	{ rank: 8, suit: d },	{ rank: 9, suit: d },
		{ rank: 10, suit: d },	{ rank: 11, suit: d },	{ rank: 12, suit: d },	{ rank: 13, suit: d },
		{ rank: 14, suit: d },
	
		{ rank: 2, suit: h },	{ rank: 3, suit: h },	{ rank: 4, suit: h },	{ rank: 5, suit: h },
		{ rank: 6, suit: h },	{ rank: 7, suit: h },	{ rank: 8, suit: h },	{ rank: 9, suit: h },
		{ rank: 10, suit: h },	{ rank: 11, suit: h },	{ rank: 12, suit: h },	{ rank: 13, suit: h },
		{ rank: 14, suit: h },
	
		{ rank: 2, suit: s },	{ rank: 3, suit: s },	{ rank: 4, suit: s },	{ rank: 5, suit: s },
		{ rank: 6, suit: s },	{ rank: 7, suit: s },	{ rank: 8, suit: s },	{ rank: 9, suit: s },
		{ rank: 10, suit: s },	{ rank: 11, suit: s },	{ rank: 12, suit: s },	{ rank: 13, suit: s },
		{ rank: 14, suit: s },
	],
	initialPot: [ { amount: 0, user_ids: [] } ],
	maxPlayers: [ 6, 5, 4, 3, 2 ],
	streets: { preflop: 'preflop', flop: 'flop', turn: 'turn', river: 'river' },
	tableTypes: [ 'Normal', 'Turbo' ],
	totalTimeNormal: 30000,
	totalTimeTurbo: 16000,

	// errors
	betGreaterThanCallAmountError: 'Player\'s bet is greater than call amount.',

	// event names
	error_message: 'error_message',
	give_chips_to_player: 'give_chips_to_player',
	player_removal: 'player_removal',
	remove_card: 'remove_card',
	reset_discard_timer_end: 'reset_discard_timer_end',
	reset_timer_end: 'reset_timer_end',
	take_player_chips: 'take_player_chips',
	update_action_chat: 'update_action_chat',
	update_actions: 'update_actions',
	update_user_chips: 'update_user_chips',

	// room names
	lobby_room: 'lobby_room',
	table_room: 'table_room_',

	// misc
	usersKey: 'users:',
};
