const PubSub = require('@google-cloud/pubsub');

function connectPubSub() {
    return new PubSub({
        projectId: 'knowledge-prototype',
        // keyFilename: 'keys/service-account.json'
    });
}

function publishPubSub(pubsub, topicName, data) {
    return pubsub
        .topic(topicName)
        .publisher()
        .publish(data)
        .then(messageId => console.log(messageId))
        .catch(err => {
            console.log(err)
        })
}

module.exports = {
    connectPubSub,
    publishPubSub
}