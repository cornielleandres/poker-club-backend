module.exports = io => socket => {
	const { applyUserEvents }	= require('../index.js');
	applyUserEvents.postAuthenticate(io, socket);
};
