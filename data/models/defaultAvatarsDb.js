const db	= require('../dbConfig.js');

module.exports = {
	getDefaultAvatarById: id => db('default-avatars').where({ id }).select('default_avatar').first(),
	getDefaultAvatars: () => db('default-avatars').select('id', 'default_avatar'),
};
