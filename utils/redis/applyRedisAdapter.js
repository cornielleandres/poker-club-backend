const adapter	= require('socket.io-redis');

// config
const {
	variables,
}	= require('../../config/index.js');

const {
	redisHost: host,
	redisPort: port,
	redisUrl: url,
}	= variables;

const error = 'error';

module.exports = io => {
	const { handleError }	= require('../index.js');
	const options = { host, port };
	const redisAdapter = adapter(url || options);
	redisAdapter.pubClient.on(error, e => handleError('pubClient error.', e));
	redisAdapter.subClient.on(error, e => handleError('subClient error.', e));
	io.adapter(redisAdapter);
};
