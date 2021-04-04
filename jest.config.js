const config = require('./config/jest.config.js');

config.modulePathIgnorePatterns = ['/config/'];

module.exports = config;
