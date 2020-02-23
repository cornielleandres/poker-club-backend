// config
const {
	constants,
	variables,
}	= require('../../../config/index.js');

// databases
const {
	tableDb,
	userDb,
}	= require('../../../data/models/index.js');

const {
	bigBlinds,
	gameTypes,
	maxPlayers,
	tableTypes,
}	= constants;

const {
	noUserChipsError,
}	= variables;

module.exports = async (socket, table, callback) => {
	const { handleError, handleUpdateLobbyTables }	= require('../../index.js');
	try {
		const { big_blind, game_type, max_players, table_type } = table;
		if (!bigBlinds.includes(big_blind)) throw new Error(`Big blind "${ big_blind }" not allowed.`);
		if (!gameTypes.includes(game_type)) throw new Error(`Game type "${ game_type }" not allowed.`);
		if (!maxPlayers.includes(max_players)) throw new Error(`Max players "${ max_players }" not allowed.`);
		if (!tableTypes.includes(table_type)) throw new Error(`Table type ${ table_type } not allowed.`);
		const user_chips = await userDb.getUserChips(socket.user_id);
		if (!user_chips) throw new Error(noUserChipsError(user_chips));
		const table_id = (await tableDb.addTable(table))[0];
		callback(table_id);
		return handleUpdateLobbyTables(null, socket);
	} catch (e) {
		return handleError('Error adding table.', e, socket);
	}
};
