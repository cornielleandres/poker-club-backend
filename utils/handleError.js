// config
const {
	constants,
	variables,
}	= require('../config/index.js');

const {
	error_message,
}	= constants;

const {
	nodeEnv,
}	= variables;

module.exports = async (errMsgDescription, e, socket, io, room) => {
	const { sendErrorEmail } = require('./index.js');
	const user_id = socket ? socket.user_id : socket;
	await sendErrorEmail(errMsgDescription, e, user_id, nodeEnv);
	// if in production, emit the error description, else emit the entire error
	const err = nodeEnv === 'production' ? errMsgDescription : errMsgDescription + ' ' + e.toString();
	if (io) return io.in(room).emit(error_message, err);
	if (socket) return socket.emit(error_message, err);
};
