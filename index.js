const {constants} = require('openbci-utilities');
const express = require('express');
const {getBoard, getStream} = require('./board');
const cloud = require('./cloud');

// cloud setup
const pubsub = cloud.connectPubSub();

// Board configuration
const board = getBoard();
const port =  constants.OBCISimulatorPortName

// Start streaming data to PubSub
function start() {
    getStream(board, port, (sample, err) => {
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
}

function stop() {
    board.streamStop()
        .then(() => console.log('STOPPED'))
        .catch(err => console.log('ERROR'))
}

// express app
const app = express()

// routes
app.get('/start', (req, res) => {
    start()
    const body ={
        "message": "STARTED"
    }
    return res.json()
})

app.get('/stop', (req, res) => {
    stop();
    const body = {
        "message": "STOPPED"
    }
    return res.json(body)
})

app.get('/info', (req, res) => {
    const info = board.getInfo()
    return res.json(info)
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening in port: ${PORT}`))