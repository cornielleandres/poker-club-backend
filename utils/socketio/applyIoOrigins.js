// config
const {
	variables,
}	= require('../../config/index.js');

const {
	frontendURL,
}	= variables;

module.exports = io => {
	const { handleError }	= require('../index.js');
	io.origins(async (origin, callback) => {
		if (origin === frontendURL) callback(null, true);
		else {
			await handleError('Origin not allowed by CORS.', `Origin: ${ origin }`);
			callback(new Error('Not allowed by CORS'));
		}
	});
};
