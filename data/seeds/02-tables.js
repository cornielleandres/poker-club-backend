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
					community_cards: JSON.stringify([
						{ rank: 14, suit: 'diamond' },
						{ rank: 13, suit: 'diamond' },
						{ rank: 12, suit: 'diamond' },
						{ rank: 11, suit: 'diamond' },
						{ rank: 10, suit: 'diamond' },
					]),
					game_type: gameTypes[0],
					max_players: maxPlayers[0],
					table_type: tableTypes[0],
				},
				{
					big_blind: bigBlinds[1],
					community_cards: JSON.stringify([
						{ rank: 8, suit: 'club' },
						{ rank: 7, suit: 'club' },
						{ rank: 6, suit: 'club' },
						{ rank: 5, suit: 'club' },
						{ rank: 4, suit: 'club' },
					]),
					game_type: gameTypes[1],
					max_players: maxPlayers[1],
					table_type: tableTypes[1],
				},
				{
					big_blind: bigBlinds[0],
					community_cards: JSON.stringify([
						{ rank: 11, suit: 'heart' },
						{ rank: 11, suit: 'diamond' },
						{ rank: 11, suit: 'spade' },
						{ rank: 11, suit: 'club' },
						{ rank: 7, suit: 'diamond' },
					]),
					game_type: gameTypes[0],
					max_players: maxPlayers[1],
					table_type: tableTypes[1],
				},
				{
					big_blind: bigBlinds[1],
					community_cards: JSON.stringify([
						{ rank: 10, suit: 'heart' },
						{ rank: 10, suit: 'diamond' },
						{ rank: 10, suit: 'spade' },
						{ rank: 9, suit: 'club' },
						{ rank: 9, suit: 'diamond' },
					]),
					game_type: gameTypes[1],
					max_players: maxPlayers[0],
					table_type: tableTypes[0],
				},
				{
					big_blind: bigBlinds[2],
					community_cards: JSON.stringify([
						{ rank: 4, suit: 'spade' },
						{ rank: 11, suit: 'spade' },
						{ rank: 8, suit: 'spade' },
						{ rank: 2, suit: 'spade' },
						{ rank: 9, suit: 'spade' },
					]),
					game_type: gameTypes[1],
					max_players: maxPlayers[2],
					table_type: tableTypes[1],
				},
				{
					big_blind: bigBlinds[3],
					community_cards: JSON.stringify([
						{ rank: 9, suit: 'club' },
						{ rank: 8, suit: 'diamond' },
						{ rank: 7, suit: 'spade' },
						{ rank: 6, suit: 'diamond' },
						{ rank: 5, suit: 'heart' },
					]),
					game_type: gameTypes[0],
					max_players: maxPlayers[3],
					table_type: tableTypes[0],
				},
				{
					big_blind: bigBlinds[4],
					community_cards: JSON.stringify([
						{ rank: 7, suit: 'club' },
						{ rank: 7, suit: 'diamond' },
						{ rank: 7, suit: 'spade' },
						{ rank: 13, suit: 'club' },
						{ rank: 3, suit: 'diamond' },
					]),
					game_type: gameTypes[1],
					max_players: maxPlayers[4],
					table_type: tableTypes[1],
				},
				{
					big_blind: bigBlinds[3],
					community_cards: JSON.stringify([
						{ rank: 4, suit: 'club' },
						{ rank: 4, suit: 'spade' },
						{ rank: 3, suit: 'club' },
						{ rank: 3, suit: 'diamond' },
						{ rank: 12, suit: 'club' },
					]),
					game_type: gameTypes[0],
					max_players: maxPlayers[3],
					table_type: tableTypes[0],
				},
				{
					big_blind: bigBlinds[4],
					community_cards: JSON.stringify([
						{ rank: 14, suit: 'heart' },
						{ rank: 14, suit: 'diamond' },
						{ rank: 8, suit: 'club' },
						{ rank: 4, suit: 'spade' },
						{ rank: 7, suit: 'heart' },
					]),
					game_type: gameTypes[1],
					max_players: maxPlayers[4],
					table_type: tableTypes[1],
				},
				{
					big_blind: bigBlinds[1],
					community_cards: JSON.stringify([
						{ rank: 3, suit: 'diamond' },
						{ rank: 11, suit: 'club' },
						{ rank: 8, suit: 'spade' },
						{ rank: 4, suit: 'heart' },
						{ rank: 2, suit: 'spade' },
					]),
					game_type: gameTypes[1],
					max_players: maxPlayers[2],
					table_type: tableTypes[0],
				},
			]);
		});
};
