const {
	variables,
}	= require('../config/index.js');

const {
	db,
}	= variables;

const dbEngine		= db || 'development';
const knexConfig	= require('../knexfile.js')[ dbEngine ];

module.exports = require('knex')(knexConfig);
