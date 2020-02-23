// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const { user_id } = socket;
		const newUserChips = (await userDb.updateClaimedDailyChips(user_id))[0];
		return callback(true, newUserChips);
	} catch (e) {
		return handleError('Error claiming daily chips.', e, socket);
	}
};
