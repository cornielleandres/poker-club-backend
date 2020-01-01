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
	const options = { host, port };
	const redisAdapter = adapter(url || options);
	redisAdapter.pubClient.on(error, e => console.log('pubClient error:', e));
	redisAdapter.subClient.on(error, e => console.log('subClient error:', e));
	io.adapter(redisAdapter);
};
