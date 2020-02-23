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
			const { id, picture: prevPicture } = user;
			// if user changed their picture, update it
			if (prevPicture !== picture) await db('users').where({ id }).update({ picture });
			// then return their user id
			return id;
		}
		// if user does not exist, add them and return the newly created user id
		return (await db('users').insert(userInfo).returning('id'))[0];
	},
	getUserById: async id => {
		const { defaultAvatarsDb }	= require('./index.js');
		const user = await db('users as u')
			.select(
				'u.avatar',
				'u.claimed_daily_chips',
				'u.dark_mode',
				'u.default_avatar_id',
				'u.id',
				'u.name',
				'u.picture',
				'u.user_chips',
				db.raw('JSON_BUILD_OBJECT(\'light\', light, \'main\', main, \'dark\', dark) AS main_color'),
			)
			.leftOuterJoin('main-colors as mc', 'u.main_color_id', 'mc.id')
			.where('u.id', id)
			.first();
		if (!user) throw new Error(userDoesNotExistError(id));
		const { avatar, default_avatar_id } = user;
		if (avatar) user.avatar = avatar.toString();
		if (default_avatar_id) {
			const default_avatar = await defaultAvatarsDb.getDefaultAvatarById(default_avatar_id);
			user.default_avatar = default_avatar;
		} else user.default_avatar = null;
		delete user.default_avatar_id;
		return user;
	},
	getUserChips,
	resetAllClaimedDailyChips: () => (
		db('users').where({ claimed_daily_chips: true }).update({ claimed_daily_chips: false })
	),
	takeBuyInFromUserChips: async (id, big_blind, trx) => {
		const user_chips = await getUserChips(id, trx);
		if (!user_chips) throw new Error(noUserChipsError(user_chips));
		const maxBuyIn = big_blind * 100;
		const table_chips = Math.min(user_chips, maxBuyIn);
		const newUserChips = user_chips - table_chips;
		await trx('users').update({ user_chips: newUserChips }).where({ id });
		return { table_chips, user_chips: newUserChips };
	},
	toggleDarkMode: id => (
		db('users')
			.where({ id })
			.update({ dark_mode: db.raw('NOT ??', [ 'dark_mode' ]) })
			.returning('dark_mode')
	),
	updateAvatar: (id, avatar) => db('users').where({ id }).update({ avatar, default_avatar_id: null }),
	updateClaimedDailyChips: id => (
		db('users')
			.where({ id })
			.update({ claimed_daily_chips: true })
			.increment({ user_chips: 500 })
			.returning('user_chips')
	),
	updateDefaultAvatar: (id, default_avatar_id) => db('users').where({ id }).update({
		avatar: null,
		default_avatar_id,
	}),
	updateMainColor: (id, main_color_id) => db('users').where({ id }).update({ main_color_id }),
	updatePicture: (id, picture) => db('users').where({ id }).update({
		picture,
		avatar: null,
		default_avatar_id: null,
	}),
	updateUser: (id, user) => db('users').where({ id }).update(user),
};
