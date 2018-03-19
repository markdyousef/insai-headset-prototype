const Cyton = require('openbci-cyton');
require('dotenv').load()

exports.getBoard = () => {
    const env = process.env.NODE_ENV;
    if (env == 'development') {
        return new Cyton({
            verbose: true,
            debug: true,
            boardType: 'daisy',
            hardSet: true
        });
    }
    if (env == 'test') {
        return new Cyton({
            verbose: true,
            simulate: true,
            boardType: 'daisy',
            simulate: true,
            simulatorDaisyModuleAttached: true,
        });
    }
}