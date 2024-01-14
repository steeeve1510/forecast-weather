
const fs = require('fs')

module.exports = { getConfig, getGoogleConfig };

function getConfig() {
    let rawConfig = fs.readFileSync('config/config.json');
    return JSON.parse(rawConfig);
}

function getGoogleConfig() {
    let rawConfig = fs.readFileSync('config/google-config.json');
    return JSON.parse(rawConfig);
}
