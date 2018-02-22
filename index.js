const {constants} = require('openbci-utilities');
const app = require('./app')

// Board configuration
const board = app.getBoard();
const port =  constants.OBCISimulatorPortName

app.getStream(board, port, (sample, err) => {
    if(err) {
        console.log('ERROR: ', err);
        return;
    }
    console.log(sample)
})
