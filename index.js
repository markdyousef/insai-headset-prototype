const {constants} = require('openbci-utilities');
const app = require('./app')
const cloud = require('./cloud');

// cloud setup
const pubsub = cloud.connectPubSub();

// // Board configuration
const board = app.getBoard();
const port =  constants.OBCISimulatorPortName
app.getStream(board, port, (sample, err) => {
    if(err) {
        console.log('ERROR: ', err);
        return;
    }

    // format data
    const payload = {
        channelData: sample.channelData,
        sampleNumer: sample.sampleNumer,
        timestamp: sample.timestamp
    }
    // buffer for Pub/Sub
    const data = JSON.stringify(payload);
    const dataBuffer = Buffer.from(data);
    

    const topicName = 'cyton-data'
    cloud.publishPubSub(pubsub, topicName, dataBuffer)
})
