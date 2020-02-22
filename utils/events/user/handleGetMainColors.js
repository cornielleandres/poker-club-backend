// config
const {
	constants,
}	= require('../../../config/index.js');

// databases
const {
	mainColorsDb,
}	= require('../../../data/models/index.js');

const {
	error_message,
}	= constants;

module.exports = async (socket, callback) => {
	try {
		const mainColors = await mainColorsDb.getMainColors();
		return callback(mainColors);
	} catch (e) {
		const errMsg = 'Get Main Colors: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
