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

module.exports = async (socket, main_color_id, callback) => {
	try {
		const { user_id } = socket;
		await userDb.updateMainColor(user_id, main_color_id);
		const newUser = await userDb.getUserById(user_id);
		return callback(newUser);
	} catch (e) {
		const errMsg = 'Update Main Color: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
