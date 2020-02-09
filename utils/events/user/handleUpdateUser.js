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

module.exports = async (socket, user, callback) => {
	try {
		const { user_id } = socket;
		await userDb.updateUser(user_id, user);
		const newUser = await userDb.getUserById(user_id);
		return callback(newUser);
	} catch (e) {
		const errMsg = 'Update User: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
