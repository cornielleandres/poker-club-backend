require('dotenv').config();

module.exports = {
	// auth0
	auth0ClientSecret: process.env.AUTH0_CLIENT_SECRET.replace(/\\n/g, '\n'),
	audience: process.env.AUTH0_API_IDENTIFIER,

	// database (development)
	dbName: process.env.DB_NAME,
	dbHost: process.env.DB_HOST,
	dbUser: process.env.DB_USER,
	dbPassword: process.env.DB_PASSWORD,

	// database (production)
	databaseURL: process.env.DATABASE_URL,
	db: process.env.DB,

	// errors
	noUserChipsError: user_chips => `You have ${ user_chips } chips left.`,

	// nodemailer
	nodemailerHost: process.env.NODEMAILER_HOST,
	nodemailerPort: process.env.NODEMAILER_PORT,
	nodemailerUser: process.env.NODEMAILER_USER,
	nodemailerPass: process.env.NODEMAILER_PASS,
	nodemailerAdminUser: process.env.NODEMAILER_ADMIN_USER,

	// redis (development)
	redisHost: process.env.REDIS_HOST,
	redisPort: process.env.REDIS_PORT || 6379,

	// redis (production)
	redisUrl: process.env.REDIS_URL,

	// server
	frontendURL: process.env.FRONTEND_URL,
	nodeEnv: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 5000,
};
