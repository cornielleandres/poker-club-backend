const db	= require('../dbConfig.js');

module.exports = {
	getDefaultAvatarById: async id => {
		const defaultAvatar = await db('default-avatars').where({ id }).select('default_avatar').first();
		if (!defaultAvatar) throw new Error(`No default avatar found with id ${ id }`);
		return defaultAvatar.default_avatar.toString();
	},
	getDefaultAvatars: () => db('default-avatars').select('id', 'default_avatar'),
};
