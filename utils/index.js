const applyIoOrigins							= require('./socketio/applyIoOrigins.js');
const applyLobbyEvents						= require('./events/lobby/applyLobbyEvents.js');
const applyRedisAdapter						= require('./redis/applyRedisAdapter.js');
const applySocketAuth							= require('./socketio/applySocketAuth.js');
const applySocketio								= require('./socketio/applySocketio.js');
const applyUserEvents							= require('./events/user/applyUserEvents.js');
const handleAddTable							= require('./events/lobby/handleAddTable.js');
const handleAuthenticate					= require('./socketio/handleAuthenticate.js');
const handleDisconnect						= require('./socketio/handleDisconnect.js');
const handleGetAllowedTableValues	= require('./events/lobby/handleGetAllowedTableValues.js');
const handleGetLobbyTables				= require('./events/lobby/handleGetLobbyTables.js');
const handleJoinTable							= require('./events/lobby/handleJoinTable.js');
const handlePostAuthenticate			= require('./socketio/handlePostAuthenticate.js');
const handleTokenAuth							= require('./socketio/handleTokenAuth.js');
const redisClient									= require('./redis/redisClient.js');

module.exports = {
	applyIoOrigins,
	applyLobbyEvents,
	applyRedisAdapter,
	applySocketAuth,
	applySocketio,
	applyUserEvents,
	handleAddTable,
	handleAuthenticate,
	handleDisconnect,
	handleGetAllowedTableValues,
	handleGetLobbyTables,
	handleJoinTable,
	handlePostAuthenticate,
	handleTokenAuth,
	redisClient,
};
