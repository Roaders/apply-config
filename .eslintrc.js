const config = require('./config/eslint-config.js');

config.rules['prettier/prettier'] = [
    'error',
    Object.assign({ tabWidth: 4, singleQuote: true, printWidth: 120 }, config.rules['prettier/prettier'][1]),
];

module.exports = config;
