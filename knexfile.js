const {
	variables,
}	= require('./config/index.js');

const {
	dbName: database,
	dbHost: host,
	dbUser: user,
	dbPassword: password,
	databaseURL,
}	= variables;

const localPg = {
	database,
	host,
	user,
	password,
};

const dbConnection = databaseURL || localPg;

const dbSettings = {
	client: 'pg',
	connection: dbConnection,
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		directory: './data/migrations',
		tableName: 'dbmigrations',
	},
	seeds: {
		directory: './data/seeds',
	},
};

module.exports = {
	development: dbSettings,
	production: dbSettings,
};
