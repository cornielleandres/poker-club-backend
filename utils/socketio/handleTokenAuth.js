const jwt	= require('jsonwebtoken');

// config
const {
	variables,
}	= require('../../config/index.js');

const {
	auth0ClientSecret,
	audience,
}	= variables;

module.exports = (token, callback) => {
	try {
		const decoded = jwt.verify(token, auth0ClientSecret);
		if (audience !== decoded.aud[0]) throw new Error('invalid audience');
	} catch (e) {
		return callback(e);
	}
};
