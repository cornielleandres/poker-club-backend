const bluebird	= require('bluebird');
const redis			= require('redis');

// config
const {
	variables,
}	= require('../../config/index.js');

const {
	redisHost: host,
	redisPort: port,
	redisUrl: url,
}	= variables;

const getRedisClient = () => {
	bluebird.promisifyAll(redis);
	const options = { host, port };
	const redisClient = redis.createClient(url || options);
	redisClient.on('error', e => {
		const { handleError }	= require('../index.js');
		return handleError('Redis error.', e);
	});
	redisClient.on('warning', e => {
		const { handleError }	= require('../index.js');
		return handleError('Redis warning.', e);
	});
	return redisClient;
};

const redisClient = getRedisClient();

module.exports = redisClient;
