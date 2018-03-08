const {getBoard} = require('./board');
const {constants} = require('openbci-utilities');
const io = require('socket.io');
const {server} = require('./index');
const ioOptions = {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
}
test('get board', () => {
    const board = getBoard();
    expect(board.isSimulating()).toBe(true)
});

describe('Websocket Board Controls', () => {
    var server = server;
    // var board = io('http://localhost:5000/', ioOptions)
    // beforeEach(done => {
    //     // start io server
    //     server.start()

    // })
})