// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	defaultAvatarsDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
}	= constants;

module.exports = async (socket, callback) => {
	try {
		const defaultAvatars = await defaultAvatarsDb.getDefaultAvatars();
		for (const avatar of defaultAvatars) avatar.default_avatar = avatar.default_avatar.toString();
		return callback(defaultAvatars);
	} catch (e) {
		const errMsg = 'Get Default Avatars: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
