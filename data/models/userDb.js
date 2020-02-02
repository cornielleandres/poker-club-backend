const db	= require('../dbConfig.js');

// config
const {
	variables,
}	= require('../../config/index.js');

const {
	noUserChipsError,
}	= variables;

const userDoesNotExistError = user_id => `User id #${ user_id } does not exist.`;

const getUserChips = async (id, trx) => {
	const knex = trx ? trx : db;
	const user = await knex('users').select('user_chips').where({ id }).first();
	if (!user) throw new Error(userDoesNotExistError(id));
	return user.user_chips;
};

module.exports = {
	addToUserChips: (id, amount) => (
		db('users').where({ id }).increment('user_chips', amount).returning('user_chips')
	),
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
		const tablePlayer = await db('table-players')
			.select('table_id')
			.where({ user_id: id })
			.orderBy('join_date', 'desc')
			.first();
		return tablePlayer ? { table_id: tablePlayer.table_id, user } : { user };
	},
	getUserChips,
	takeBuyInFromUserChips: async (id, big_blind, trx) => {
		const user_chips = await getUserChips(id, trx);
		if (!user_chips) throw new Error(noUserChipsError(user_chips));
		const maxBuyIn = big_blind * 100;
		const table_chips = Math.min(user_chips, maxBuyIn);
		const newUserChips = user_chips - table_chips;
		await trx('users').update({ user_chips: newUserChips }).where({ id });
		return { table_chips, user_chips: newUserChips };
	},
};
