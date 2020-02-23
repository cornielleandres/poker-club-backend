const applyIoOrigins									= require('./socketio/applyIoOrigins.js');
const applyLobbyEvents								= require('./events/lobby/applyLobbyEvents.js');
const applyRedisAdapter								= require('./redis/applyRedisAdapter.js');
const applySocketAuth									= require('./socketio/applySocketAuth.js');
const applySocketioAndRunJobs					= require('./socketio/applySocketioAndRunJobs.js');
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
const handleClaimDailyChips						= require('./events/user/handleClaimDailyChips.js');
const handleDefaultAction							= require('./events/table/handleDefaultAction.js');
const handleDiscardTimers							= require('./events/table/handleDiscardTimers.js');
const handleDisconnect								= require('./socketio/handleDisconnect.js');
const handleEndOfAction								= require('./events/table/handleEndOfAction.js');
const handleError											= require('./handleError.js');
const handleGetDefaultAvatars					= require('./events/user/handleGetDefaultAvatars.js');
const handleGetLobbyTables						= require('./events/lobby/handleGetLobbyTables.js');
const handleGetMainColors							= require('./events/user/handleGetMainColors.js');
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
const handleToggleDarkMode						= require('./events/user/handleToggleDarkMode.js');
const handleTokenAuth									= require('./socketio/handleTokenAuth.js');
const handleUpdateActionAndTimer			= require('./events/table/handleUpdateActionAndTimer.js');
const handleUpdateAvatar							= require('./events/user/handleUpdateAvatar.js');
const handleUpdateDefaultAvatar				= require('./events/user/handleUpdateDefaultAvatar.js');
const handleUpdateLobbyTables					= require('./events/lobby/handleUpdateLobbyTables.js');
const handleUpdateMainColor						= require('./events/user/handleUpdateMainColor.js');
const handleUpdatePicture							= require('./events/user/handleUpdatePicture.js');
const handleUpdatePotAndResetBets			= require('./events/table/handleUpdatePotAndResetBets.js');
const handleUpdateUser								= require('./events/user/handleUpdateUser.js');
const isNonEmptyObject								= require('./events/table/isNonEmptyObject.js');
const redisClient											= require('./redis/redisClient.js');
const revealPlayerCards								= require('./events/table/revealPlayerCards.js');
const runJobs													= require('./jobs/runJobs.js');
const sendErrorEmail									= require('./sendErrorEmail.js');

module.exports = {
	applyIoOrigins,
	applyLobbyEvents,
	applyRedisAdapter,
	applySocketAuth,
	applySocketioAndRunJobs,
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
	handleClaimDailyChips,
	handleDefaultAction,
	handleDiscardTimers,
	handleDisconnect,
	handleEndOfAction,
	handleError,
	handleGetDefaultAvatars,
	handleGetLobbyTables,
	handleGetMainColors,
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
	handleToggleDarkMode,
	handleTokenAuth,
	handleUpdateActionAndTimer,
	handleUpdateAvatar,
	handleUpdateDefaultAvatar,
	handleUpdateLobbyTables,
	handleUpdateMainColor,
	handleUpdatePicture,
	handleUpdatePotAndResetBets,
	handleUpdateUser,
	isNonEmptyObject,
	redisClient,
	revealPlayerCards,
	runJobs,
	sendErrorEmail,
};
