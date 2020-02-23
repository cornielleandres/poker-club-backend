// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, main_color_id, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const { user_id } = socket;
		await userDb.updateMainColor(user_id, main_color_id);
		const newUser = await userDb.getUserById(user_id);
		return callback(newUser);
	} catch (e) {
		return handleError('Error updating main color.', e, socket);
	}
};
