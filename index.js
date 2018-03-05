const {constants} = require('openbci-utilities');
const {getBoard, getStream} = require('./board');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cloud = require('./cloud');

const PORT = process.env.PORT || 5000;
// cloud setup
const pubsub = cloud.connectPubSub();

// Board configuration
const board = getBoard();
const port =  constants.OBCISimulatorPortName

// Start streaming data to PubSub
function start(socket, pubsub=false) {
    getStream(board, port, (sample, err) => {
        if(err) {
            return socket.emit('START_BOARD_ERROR', err)
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

        if (pubsub) {
            const topicName = 'cyton-data'
            cloud.publishPubSub(pubsub, topicName, dataBuffer)
        }

        return socket.emit('START_BOARD_SUCCESS', data)
    })
}

function stop(socket) {
    board.streamStop()
        .then(() => socket.emit('STOP_BOARD_SUCCESS', {message: 'stopped'}))
        .catch(err => socket.emit('STOP_BOARD_ERROR', err))
}

server.listen(5000)

app.get('/', (req, res) => {
    return res.json({})
});
// Socket connection
io.on('connection', (socket) => {
    console.log('Connected');
    socket.emit('BOARD_INFO', board.getInfo())

    socket.on('START_BOARD_STREAM', (data) => {
        start(socket);
    });
    socket.on('STOP_BOARD_STREAM', (data) => {
        stop(socket);
    })
});
