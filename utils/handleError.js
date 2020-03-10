// config
const {
	constants,
	variables,
}	= require('../config/index.js');

const {
	error_message,
	joiningTableError,
	tableDoesNotExistError,
}	= constants;

const {
	nodeEnv,
}	= variables;

module.exports = async (errMsgDescription, e, socket, io, room) => {
	const { sendErrorEmail } = require('./index.js');
	const user_id = socket ? socket.user_id : 0;
	const errorStack = e.stack ? e.stack.toString() : e;
	// if the error is that the player tried to join a table that does not exist anymore,
	// no email needs to be sent for this, otherwise, send the error email
	if (!(errMsgDescription === joiningTableError && e.toString() === `Error: ${ tableDoesNotExistError }`)) {
		await sendErrorEmail(errMsgDescription, errorStack, user_id, nodeEnv);
	}
	// if in production, emit only the error description, else emit the entire error
	const err = (nodeEnv === 'production') ? errMsgDescription : errMsgDescription + '\n' + errorStack;
	if (io) return io.in(room).emit(error_message, err);
	if (socket) return socket.emit(error_message, err);
};
