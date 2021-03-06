const Jimp	= require('jimp');

// databases
const {
	userDb,
}	= require('../../../data/models/index.js');

module.exports = (socket, avatar, callback) => {
	const { handleError }	= require('../../index.js');
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
		return handleError('Error updating avatar.', e, socket);
	}
};
