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
	redisClient.on('error', err => console.log('Redis error:', err));
	redisClient.on('end', () => console.log('Redis connection closed.'));
	return redisClient;
};

const redisClient = getRedisClient();

module.exports = redisClient;
