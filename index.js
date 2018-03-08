const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {constants} = require('openbci-utilities');
const cloud = require('./cloud');
const {getBoard} = require('./board');

const PORT = process.env.PORT || 5000;
// cloud setup
const pubsub = cloud.connectPubSub();

// Start streaming data to PubSub
function start(board, socket, pubsub=false) {
    if (!board.isStreaming()) board.streamStart();
    board.on('sample', (sample, err) => {
        if (err) {
            return socket.emit('BOARD_STREAM_ERROR', JSON.stringify(err))
        }
        console.log('started')
        socket.emit('BOARD_STREAM_SUCCESS')
        // format data
        const payload = {
            channelData: sample.channelData,
            sampleNumer: sample.sampleNumer,
            timestamp: sample.timestamp
        }
        const data = JSON.stringify(payload);
        // Pub/Sub
        const dataBuffer = Buffer.from(data);
        if (pubsub) {
            const topicName = 'cyton-data'
            cloud.publishPubSub(pubsub, topicName, dataBuffer)
        }

        return socket.emit('BOARD_STREAM_DATA', data)
    })
}

function stop(board, socket) {
    board.streamStop()
        .then(() => socket.emit('STOP_BOARD_SUCCESS', {message: 'stopped'}))
        .catch(err => socket.emit('STOP_BOARD_ERROR', err))
}

app.get('/', (req, res) => {
    return res.json({})
});
// Socket connection
io.on('connection', (socket) => {
    console.log('Websocket connected');
    // Board configuration
    const board = getBoard();
    const port =  constants.OBCISimulatorPortName

    socket.on('CONNECT_BOARD', (config) => {
        board.connect(port)
            .then((res) => {
                socket.emit('CONNECT_BOARD_SUCCESS')
                board.on('ready', () => {
                    socket.on('START_BOARD_STREAM', (streamConfig) => start(board, socket, streamConfig))
                    socket.on('STOP_BOARD_STREAM', () => stop(board, socket))
                })
            })
            .catch((err) => socket.emit('CONNECT_BOARD_FAILURE', JSON.stringify(err)))
    })
});

exports.server = server.listen(PORT || 5000)