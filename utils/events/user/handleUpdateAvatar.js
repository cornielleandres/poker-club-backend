const Jimp	= require('jimp');

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

module.exports = (socket, avatar, callback) => {
	try {
		const { user_id } = socket;
		const base64Callback = async (err, newAvatar) => {
			if (err) throw err;
			await userDb.updateAvatar(user_id, newAvatar);
			const newUser = await userDb.getUserById(user_id);
			return callback(newUser);
		};
		return Jimp.read(avatar, (err, image) => {
			if (err) throw err;
			return image
				.scaleToFit(56, 56) // scale img to largest size that fits inside the given width and height
				.getBase64(Jimp.AUTO, base64Callback); // generate a Base64 data URI
		});
	} catch (e) {
		const errMsg = 'Update Avatar: ' + e.toString();
		console.log(errMsg);
		return socket.emit(error_message, errMsg);
	}
};
