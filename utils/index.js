const applyIoOrigins							= require('./socketio/applyIoOrigins.js');
const applyLobbyEvents						= require('./events/lobby/applyLobbyEvents.js');
const applyRedisAdapter						= require('./redis/applyRedisAdapter.js');
const applySocketAuth							= require('./socketio/applySocketAuth.js');
const applySocketio								= require('./socketio/applySocketio.js');
const applyTableEvents						= require('./events/table/applyTableEvents.js');
const applyUserEvents							= require('./events/user/applyUserEvents.js');
const getNextPlayer								= require('./events/table/getNextPlayer.js');
const handleAddTable							= require('./events/lobby/handleAddTable.js');
const handleAuthenticate					= require('./socketio/handleAuthenticate.js');
const handleDisconnect						= require('./socketio/handleDisconnect.js');
const handleGetLobbyTables				= require('./events/lobby/handleGetLobbyTables.js');
const handlePlayerJoins						= require('./events/table/handlePlayerJoins.js');
const handlePlayerLeaves					= require('./events/table/handlePlayerLeaves.js');
const handlePostAuthenticate			= require('./socketio/handlePostAuthenticate.js');
const handleTablePlayerPayloads		= require('./events/table/handleTablePlayerPayloads.js');
const handleTokenAuth							= require('./socketio/handleTokenAuth.js');
const handleUpdateLobbyTables			= require('./events/lobby/handleUpdateLobbyTables.js');
const isNonEmptyObject						= require('./events/table/isNonEmptyObject.js');
const redisClient									= require('./redis/redisClient.js');

module.exports = {
	applyIoOrigins,
	applyLobbyEvents,
	applyRedisAdapter,
	applySocketAuth,
	applySocketio,
	applyTableEvents,
	applyUserEvents,
	getNextPlayer,
	handleAddTable,
	handleAuthenticate,
	handleDisconnect,
	handleGetLobbyTables,
	handlePlayerJoins,
	handlePlayerLeaves,
	handlePostAuthenticate,
	handleTablePlayerPayloads,
	handleTokenAuth,
	handleUpdateLobbyTables,
	isNonEmptyObject,
	redisClient,
};
