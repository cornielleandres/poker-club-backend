// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	bigBlinds,
	error_message,
	gameTypes,
	maxPlayers,
	tableTypes,
}	= constants;

module.exports = (socket, callback) => {
	try {
		return callback({ bigBlinds, gameTypes, maxPlayers, tableTypes });
	} catch (e) {
		const errMsg = 'Handle Get Allowed Table Values Error: ' + e.toString();
		return socket.emit(error_message, errMsg);
	}
};
