// databases
const {
	tablePlayerDb,
}	= require('../../../data/models/index.js');

module.exports = async user_id => {
	const player = await tablePlayerDb.getTablePlayerByUserId(user_id); // throws error if no player found
	if (!player.action) throw new Error('The action is currently not on you.');
	return player;
};
