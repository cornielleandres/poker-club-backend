module.exports = async (socket, callback) => {
	const { handleError, handleUpdateLobbyTables }	= require('../../index.js');
	try {
		return handleUpdateLobbyTables(null, socket, callback);
	} catch (e) {
		return handleError('Error getting lobby tables.', e, socket);
	}
};
