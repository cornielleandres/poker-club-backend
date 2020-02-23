const CronJob	= require('cron').CronJob;

// databases
const {
	userDb,
}	= require('../../data/models/index.js');

// reset all users' claimed daily chips every day at midnight
const resetAllClaimedDailyChips = io => {
	const { handleError }	= require('../index.js');
	// note: this cronTime can accept six fields, with 1 second as the finest granularity('* * * * * *')
	const cronTime = '0 0 * * *'; // fire off job every day at midnight
	const onTick = async () => {
		try {
			await userDb.resetAllClaimedDailyChips();
			io.emit('update_claimed_daily_chips', false); // sending to all connected clients
		} catch (e) {
			return handleError('Error resetting claimed daily chips.', e);
		}
	};
	const runOnInit = true; // will immediately fire onTick function after initialization
	const cronJob = new CronJob(cronTime, onTick, null, null, null, null, runOnInit);
	cronJob.start();
};

const jobs = [ resetAllClaimedDailyChips ];

const runJobs = io => {
	for (const job of jobs) job(io);
};

module.exports = runJobs;
