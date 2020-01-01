const socketAuth	= require('socketio-auth');

module.exports = io => {
	const { handleAuthenticate, handleDisconnect, handlePostAuthenticate }	= require('../index.js');
	socketAuth(io, {
		authenticate: handleAuthenticate(io),
		postAuthenticate: handlePostAuthenticate(io),
		disconnect: handleDisconnect(io),
	});
};
