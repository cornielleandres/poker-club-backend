// databases
const {
	mainColorsDb,
}	= require('../../../data/models/index.js');

module.exports = async (socket, callback) => {
	const { handleError }	= require('../../index.js');
	try {
		const mainColors = await mainColorsDb.getMainColors();
		return callback(mainColors);
	} catch (e) {
		return handleError('Error getting main colors.', e, socket);
	}
};
