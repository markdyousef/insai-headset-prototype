const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cloud = require('./cloud');
const {getBoard, getPort} = require('./board');
const {constants} = require('openbci-utilities');
const PORT = process.env.PORT || 9999;
// cloud setup
const pubsub = cloud.connectPubSub();

// Start streaming data to PubSub
function start(board, socket, streamConfig) {
    board.streamStart();
    console.log('STREAM START');
    board.on('sample', (sample, err) => {
        if (err) {
            return socket.emit('BOARD_STREAM_ERROR', JSON.stringify(err))
        }
        socket.emit('BOARD_STREAM_SUCCESS')
        // format data
        const payload = {
            channelData: sample.channelData,
            sampleNumber: sample.sampleNumber,
            timestamp: sample.timestamp
        }
        const data = JSON.stringify(payload);
        // Pub/Sub
        const dataBuffer = Buffer.from(data);
        if (streamConfig.pubsub) {
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

function updateChannel(board, socket, config) {
    board.channelSet(...Object.values(config))
        .then(res => socket.emit('UPDATE_CHANNEL_SUCCESS', JSON.stringify(res)))
        .catch(err => socket.emit('UPDATE_CHANNEL_FAILURE', JSON.stringify(err)))
}

function connect(board, port, socket) {
    socket.on('CONNECT_BOARD', () => {
        board.connect(port)
            .then(() => {
                socket.emit('CONNECT_BOARD_SUCCESS')
                board.on('ready', () => {
                    console.log('READY');
                    socket.on('START_BOARD_STREAM', () => start(board, socket, {pubsub: true}))
                    socket.on('STOP_BOARD_STREAM', () => stop(board, socket))
                    socket.on('UPDATE_CHANNEL', config => updateChannel(board, socket, config))
                })
            })
            .catch((err) => socket.emit('CONNECT_BOARD_FAILURE', JSON.stringify(err)))
    })
}

app.get('/', (req, res) => {
    return res.json({})
});
// Socket connection
io.on('connection', (socket) => {
    console.log('Websocket connected');
    // Board configuration
    if (process.env.NODE_ENV == 'test') {
        const board = getBoard();
        return connect(board, constants.OBCISimulatorPortName, socket)
    }
    const board = getBoard()
    board.autoFindOpenBCIBoard()
        .then(port => {
            if (port) {
                console.log('PORT: ', port);
                connect(board, port, socket)
            } else {
                // unable autofind board
                console.log("No board found")
            }
        })
        .catch(err => console.log(err))
});

exports.server = server.listen(PORT)