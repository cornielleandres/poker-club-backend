const io	= require('socket.io')();

module.exports = server => {
	const { applyIoOrigins, applyRedisAdapter, applySocketAuth, runJobs }	= require('../index.js');
	io.attach(server);
	applyIoOrigins(io);
	applyRedisAdapter(io);
	applySocketAuth(io);
	runJobs(io);
};
