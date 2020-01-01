// config
const {
	variables,
}	= require('../../config/index.js');

const {
	frontendURL,
}	= variables;

module.exports = io => {
	io.origins((origin, callback) => {
		if (origin === frontendURL) callback(null, true);
		else callback(new Error('Not allowed by CORS'));
	});
};
