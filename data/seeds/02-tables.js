const {
	constants,
}	= require('../../config/index.js');

const {
	bigBlinds,
	gameTypes,
	maxPlayers,
	tableTypes,
} = constants;

exports.seed = function(knex) {
	// Deletes ALL existing entries
	return knex('tables').del()
		.then(function () {
		// Inserts seed entries
			return knex('tables').insert([
				{
					big_blind: bigBlinds[0],
					game_type: gameTypes[0],
					max_players: maxPlayers[0],
					table_type: tableTypes[0],
				},
				{
					big_blind: bigBlinds[1],
					game_type: gameTypes[1],
					max_players: maxPlayers[1],
					table_type: tableTypes[1],
				},
				{
					big_blind: bigBlinds[0],
					game_type: gameTypes[0],
					max_players: maxPlayers[1],
					table_type: tableTypes[1],
				},
				{
					big_blind: bigBlinds[1],
					game_type: gameTypes[1],
					max_players: maxPlayers[0],
					table_type: tableTypes[0],
				},
				{
					big_blind: bigBlinds[2],
					game_type: gameTypes[1],
					max_players: maxPlayers[2],
					table_type: tableTypes[1],
				},
			]);
		});
};
