const nodeGeocoder = require('node-geocoder');

const options = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: '7drAr8Wk9yCk5LSJ1XAiFguY8v8NmqMj',
    formatter: null,
};

const geocoder = nodeGeocoder(options);

module.exports = geocoder;