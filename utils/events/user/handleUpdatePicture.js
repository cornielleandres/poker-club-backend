// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, picture, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const { user_id } = socket;
		await userDb.updatePicture(user_id, picture);
		const newUser = await userDb.getUserById(user_id);
		return callback(newUser);
	} catch (e) {
		return handleError('Error updating picture.', e, socket);
	}
};
