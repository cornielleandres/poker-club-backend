const jwt	= require('jsonwebtoken');

// config
const {
	variables,
}	= require('../../config/index.js');

const {
	auth0ClientSecret,
	audience,
}	= variables;

module.exports = async (token, callback) => {
	const { handleError }	= require('../index.js');
	try {
		const decoded = jwt.verify(token, auth0ClientSecret);
		if (audience !== decoded.aud[0]) throw new Error('invalid audience');
	} catch (e) {
		await handleError('Error handling token authentication.', e);
		return callback(e);
	}
};
