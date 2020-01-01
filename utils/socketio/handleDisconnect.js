module.exports = io => socket => {
	const { applyUserEvents }	= require('../index.js');
	applyUserEvents.disconnect(io, socket);
};
