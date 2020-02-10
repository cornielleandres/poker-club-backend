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

module.exports = async (socket, picture, callback) => {
	try {
		const { user_id } = socket;
		await userDb.updatePicture(user_id, picture);
		const newUser = await userDb.getUserById(user_id);
		return callback(newUser);
	} catch (e) {
		const errMsg = 'Update Picture: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
