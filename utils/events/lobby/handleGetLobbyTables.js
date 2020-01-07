// config
const {
	constants,
}	= require('../../../config/index.js');

// models
const {
	tableDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
}	= constants;

module.exports = async (socket, callback) => {
	try {
		const lobbyTables = await tableDb.getLobbyTables();
		return callback(lobbyTables);
	} catch (e) {
		const errMsg = 'Handle Get Lobby Tables Error: ' + e.toString();
		return socket.emit(error_message, errMsg);
	}
};
