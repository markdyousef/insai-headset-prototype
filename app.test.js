const app = require('./app');
const {constants} = require('openbci-utilities');

var board = null;
test('get board', () => {
    board = app.getBoard();
    expect(board.isSimulating()).toBe(true)
});
