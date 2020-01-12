// config
const {
	constants,
}	= require('../../../config/index.js');

const {
	error_message,
}	= constants;

module.exports = async (socket, callback) => {
	try {
		const { handleUpdateLobbyTables }	= require('../../index.js');
		return handleUpdateLobbyTables(null, null, callback);
	} catch (e) {
		const errMsg = 'Get Lobby Tables: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
