module.exports = io => (socket, data, callback) => {
	const { applyUserEvents, handleTokenAuth }	= require('../index.js');
	const { token, payload } = data;
	handleTokenAuth(token, callback);
	applyUserEvents.authenticate(io, socket, payload, callback);
};
