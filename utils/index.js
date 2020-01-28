const applyIoOrigins									= require('./socketio/applyIoOrigins.js');
const applyLobbyEvents								= require('./events/lobby/applyLobbyEvents.js');
const applyRedisAdapter								= require('./redis/applyRedisAdapter.js');
const applySocketAuth									= require('./socketio/applySocketAuth.js');
const applySocketio										= require('./socketio/applySocketio.js');
const applyTableEvents								= require('./events/table/applyTableEvents.js');
const applyUserEvents									= require('./events/user/applyUserEvents.js');
const delay														= require('./delay.js');
const distributePotToWinners					= require('./events/table/distributePotToWinners.js');
const getNextPlayer										= require('./events/table/getNextPlayer.js');
const getNextStreet										= require('./events/table/getNextStreet.js');
const getPlayerIfActionOnPlayer				= require('./events/table/getPlayerIfActionOnPlayer.js');
const handleAddTable									= require('./events/lobby/handleAddTable.js');
const handleAddToPlayerChat						= require('./events/table/handleAddToPlayerChat.js');
const handleAuthenticate							= require('./socketio/handleAuthenticate.js');
const handleDefaultAction							= require('./events/table/handleDefaultAction.js');
const handleDiscardTimers							= require('./events/table/handleDiscardTimers.js');
const handleDisconnect								= require('./socketio/handleDisconnect.js');
const handleEndOfAction								= require('./events/table/handleEndOfAction.js');
const handleGetLobbyTables						= require('./events/lobby/handleGetLobbyTables.js');
const handleGetNewCards								= require('./events/table/handleGetNewCards.js');
const handleGetNewHand								= require('./events/table/handleGetNewHand.js');
const handleIfNextPlayerDisconnected	= require('./events/table/handleIfNextPlayerDisconnected.js');
const handlePlayerCalls								= require('./events/table/handlePlayerCalls.js');
const handlePlayerChecks							= require('./events/table/handlePlayerChecks.js');
const handlePlayerDiscards						= require('./events/table/handlePlayerDiscards.js');
const handlePlayerFolds								= require('./events/table/handlePlayerFolds.js');
const handlePlayerJoins								= require('./events/table/handlePlayerJoins.js');
const handlePlayerLeaves							= require('./events/table/handlePlayerLeaves.js');
const handlePlayerRaises							= require('./events/table/handlePlayerRaises.js');
const handlePlayerTimer								= require('./events/table/handlePlayerTimer.js');
const handlePostAuthenticate					= require('./socketio/handlePostAuthenticate.js');
const handleRemovePlayers							= require('./events/table/handleRemovePlayers.js');
const handleShowdown									= require('./events/table/handleShowdown.js');
const handleTablePlayerPayloads				= require('./events/table/handleTablePlayerPayloads.js');
const handleTakeBlinds								= require('./events/table/handleTakeBlinds.js');
const handleTokenAuth									= require('./socketio/handleTokenAuth.js');
const handleUpdateActionAndTimer			= require('./events/table/handleUpdateActionAndTimer.js');
const handleUpdateLobbyTables					= require('./events/lobby/handleUpdateLobbyTables.js');
const handleUpdatePotAndResetBets			= require('./events/table/handleUpdatePotAndResetBets.js');
const isNonEmptyObject								= require('./events/table/isNonEmptyObject.js');
const redisClient											= require('./redis/redisClient.js');
const revealPlayerCards								= require('./events/table/revealPlayerCards.js');

module.exports = {
	applyIoOrigins,
	applyLobbyEvents,
	applyRedisAdapter,
	applySocketAuth,
	applySocketio,
	applyTableEvents,
	applyUserEvents,
	delay,
	distributePotToWinners,
	getNextPlayer,
	getNextStreet,
	getPlayerIfActionOnPlayer,
	handleAddTable,
	handleAddToPlayerChat,
	handleAuthenticate,
	handleDefaultAction,
	handleDiscardTimers,
	handleDisconnect,
	handleEndOfAction,
	handleGetLobbyTables,
	handleGetNewCards,
	handleGetNewHand,
	handleIfNextPlayerDisconnected,
	handlePlayerCalls,
	handlePlayerChecks,
	handlePlayerDiscards,
	handlePlayerFolds,
	handlePlayerJoins,
	handlePlayerLeaves,
	handlePlayerRaises,
	handlePlayerTimer,
	handlePostAuthenticate,
	handleRemovePlayers,
	handleShowdown,
	handleTablePlayerPayloads,
	handleTakeBlinds,
	handleTokenAuth,
	handleUpdateActionAndTimer,
	handleUpdateLobbyTables,
	handleUpdatePotAndResetBets,
	isNonEmptyObject,
	redisClient,
	revealPlayerCards,
};
