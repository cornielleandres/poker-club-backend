// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, default_avatar_id, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const { user_id } = socket;
		await userDb.updateDefaultAvatar(user_id, default_avatar_id);
		const newUser = await userDb.getUserById(user_id);
		return callback(newUser);
	} catch (e) {
		return handleError('Error updating default avatar.', e, socket);
	}
};
