// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
}	= constants;

module.exports = async (socket, callback) => {
	try {
		const { user_id } = socket;
		const newUserChips = (await userDb.updateClaimedDailyChips(user_id))[0];
		return callback(true, newUserChips);
	} catch (e) {
		const errMsg = 'Claim Daily Chips: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
