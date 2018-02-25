const {getBoard, getStream, stopStream} = require('./board');
const {constants} = require('openbci-utilities');

test('get board', () => {
    const board = getBoard();
    expect(board.isSimulating()).toBe(true)
});

test('start streaming', () => {
    const board = getBoard();
    function callback(sample) {
        expect(sample).toBe({});
        done();
    }
    getStream(board, 3000, callback)
})

test('stop streaming', () => {
    const board = getBoard();
    hasStopped = stopStream(board)
    expect(hasStopped).toBe(true)
})
