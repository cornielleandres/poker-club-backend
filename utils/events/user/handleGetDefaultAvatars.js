// databases
const {
	defaultAvatarsDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const defaultAvatars = await defaultAvatarsDb.getDefaultAvatars();
		for (const avatar of defaultAvatars) avatar.default_avatar = avatar.default_avatar.toString();
		return callback(defaultAvatars);
	} catch (e) {
		return handleError('Error getting default avatars.', e, socket);
	}
};
