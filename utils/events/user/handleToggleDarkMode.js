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

module.exports = async (socket, callback) => {
	try {
		const { user_id } = socket;
		const newDarkMode = (await userDb.toggleDarkMode(user_id))[0];
		return callback(newDarkMode);
	} catch (e) {
		const errMsg = 'Toggle Dark Mode: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
