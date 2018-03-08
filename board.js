const Cyton = require('openbci-cyton');
require('dotenv').load()

function getBoard(environment) {
    const env = environment || process.env.NODE_ENV;
    if (env == 'development') {
        return new Cyton({
            verbose: true,
            debug: true
        });
    }
    if (env == 'test') {
        return new Cyton({
            verbose: true,
            simulate: true
        });
    }
}

module.exports = {
    getBoard
}