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

function getStream(board, port, cb) {
    board.connect(port)
        .then(() => {
            board.on('ready', () => {
                board.streamStart();
                board.on('sample', cb);
            })
        })
        .catch(err => cb(null, err));
}


module.exports = {
    getBoard,
    getStream
}