const applyIoOrigins					= require('./socketio/applyIoOrigins.js');
const applyRedisAdapter				= require('./redis/applyRedisAdapter.js');
const applySocketAuth					= require('./socketio/applySocketAuth.js');
const applySocketio						= require('./socketio/applySocketio.js');
const applyUserEvents					= require('./events/user/applyUserEvents.js');
const handleAuthenticate			= require('./socketio/handleAuthenticate.js');
const handleDisconnect				= require('./socketio/handleDisconnect.js');
const handlePostAuthenticate	= require('./socketio/handlePostAuthenticate.js');
const handleTokenAuth					= require('./socketio/handleTokenAuth.js');
const redisClient							= require('./redis/redisClient.js');

module.exports = {
	applyIoOrigins,
	applyRedisAdapter,
	applySocketAuth,
	applySocketio,
	applyUserEvents,
	handleAuthenticate,
	handleDisconnect,
	handlePostAuthenticate,
	handleTokenAuth,
	redisClient,
};
