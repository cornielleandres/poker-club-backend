const db	= require('../dbConfig.js');

module.exports = { getMainColors: () => db('main-colors').select('id', 'light', 'main', 'dark') };
