const db	= require('../dbConfig.js');

const userDoesNotExistError = user_id => `User id ${ user_id } does not exist.`;

module.exports = {
	getOrAddUser: async userInfo => {
		const { email, picture } = userInfo;
		const user = await db('users').select('id', 'picture').where({ email }).first();
		if (user) {
			const { id: userId, picture: userPicture } = user;
			// if user changed their picture, update it before returning the user id
			if (userPicture !== picture) {
				user.picture = picture;
				await db('users').update(user).where({ id: userId });
			}
			return userId;
		}
		// if user does not exist, add them and return the newly added user id
		return (await db('users').insert(userInfo).returning('id'))[0];
	},
	getUserById: async id => {
		const user = await db('users').select('id', 'name', 'picture', 'user_chips').where({ id }).first();
		if (!user) throw new Error(userDoesNotExistError(id));
		const tablePlayer = await db('table-players').select('table_id').where({ user_id: id }).first();
		return tablePlayer ? { user, table_id: tablePlayer.table_id } : { user };
	},
	takeBuyInFromUserChips: async (id, big_blind, trx) => {
		const user = await trx('users').select('user_chips').where({ id }).first();
		if (!user) throw new Error(userDoesNotExistError(id));
		const { user_chips } = user;
		if (!user_chips) throw new Error('You have no more chips left.');
		const maxBuyIn = big_blind * 100;
		const table_chips = Math.min(user_chips, maxBuyIn);
		const newUserChips = user_chips - table_chips;
		await trx('users').update({ user_chips: newUserChips }).where({ id });
		return { table_chips, user_chips: newUserChips };
	},
};
