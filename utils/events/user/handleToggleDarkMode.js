// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const { user_id } = socket;
		const newDarkMode = (await userDb.toggleDarkMode(user_id))[0];
		return callback(newDarkMode);
	} catch (e) {
		return handleError('Error toggling dark mode.', e, socket);
	}
};
