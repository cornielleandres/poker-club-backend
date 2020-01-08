const applyIoOrigins							= require('./socketio/applyIoOrigins.js');
const applyLobbyEvents						= require('./events/lobby/applyLobbyEvents.js');
const applyRedisAdapter						= require('./redis/applyRedisAdapter.js');
const applySocketAuth							= require('./socketio/applySocketAuth.js');
const applySocketio								= require('./socketio/applySocketio.js');
const applyTableEvents						= require('./events/table/applyTableEvents.js');
const applyUserEvents							= require('./events/user/applyUserEvents.js');
const handleAddTable							= require('./events/lobby/handleAddTable.js');
const handleAuthenticate					= require('./socketio/handleAuthenticate.js');
const handleDisconnect						= require('./socketio/handleDisconnect.js');
const handleGetAllowedTableValues	= require('./events/lobby/handleGetAllowedTableValues.js');
const handleGetLobbyTables				= require('./events/lobby/handleGetLobbyTables.js');
const handlePlayerJoins						= require('./events/table/handlePlayerJoins.js');
const handlePostAuthenticate			= require('./socketio/handlePostAuthenticate.js');
const handleTokenAuth							= require('./socketio/handleTokenAuth.js');
const isNonEmptyObject						= require('./isNonEmptyObject.js');
const redisClient									= require('./redis/redisClient.js');

module.exports = {
	applyIoOrigins,
	applyLobbyEvents,
	applyRedisAdapter,
	applySocketAuth,
	applySocketio,
	applyTableEvents,
	applyUserEvents,
	handleAddTable,
	handleAuthenticate,
	handleDisconnect,
	handleGetAllowedTableValues,
	handleGetLobbyTables,
	handlePlayerJoins,
	handlePostAuthenticate,
	handleTokenAuth,
	isNonEmptyObject,
	redisClient,
};
