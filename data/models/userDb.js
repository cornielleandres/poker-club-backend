const db	= require('../dbConfig.js');

// config
const {
	constants,
	variables,
}	= require('../../config/index.js');

const {
	users,
}	= constants;

const {
	userDoesNotExistError,
}	= variables;

module.exports = {
	getOrAddUser: async userInfo => {
		const { email, picture } = userInfo;
		const user = await db(users)
			.where({ email })
			.select('id', 'picture')
			.first();
		if (user) {
			const { id: userId, picture: userPicture } = user;
			// if user changed their picture, update it before returning the user id
			if (userPicture !== picture) {
				user.picture = picture;
				await db(users).where({ id: userId }).update(user);
			}
			return userId;
		}
		// if user does not exist, add them and return the newly added user id
		return (await db(users).insert(userInfo).returning('id'))[0];
	},
	getUserById: async id => {
		try {
			const user = await db(users)
				.where({ id })
				.select('id', 'chips', 'name', 'picture')
				.first();
			if (!user) throw new Error(userDoesNotExistError(id));
			return { user };
		} catch (e) {
			throw new Error(e);
		}
	},
};
