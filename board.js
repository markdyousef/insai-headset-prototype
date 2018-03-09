const Cyton = require('openbci-cyton');
require('dotenv').load()

exports.getBoard = () => {
    const env = process.env.NODE_ENV;
    console.log(env);
    if (env == 'development') {
        return new Cyton({
            verbose: true,
            debug: true,
            boardType: 'daisy'
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