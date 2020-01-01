const io	= require('socket.io')();

module.exports = server => {
	const { applyIoOrigins, applyRedisAdapter, applySocketAuth }	= require('../index.js');
	io.attach(server);
	applyIoOrigins(io);
	applyRedisAdapter(io);
	applySocketAuth(io);
};
