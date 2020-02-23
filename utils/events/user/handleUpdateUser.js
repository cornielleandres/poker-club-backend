// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, user, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const { user_id } = socket;
		await userDb.updateUser(user_id, user);
		const newUser = await userDb.getUserById(user_id);
		return callback(newUser);
	} catch (e) {
		return handleError('Error updating user.', e, socket);
	}
};
