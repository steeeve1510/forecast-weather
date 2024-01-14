const { GoogleSpreadsheet } = require('google-spreadsheet');
const configService = require('../config-service');
const JWT = require('google-auth-library').JWT;

module.exports = { store };

async function store(forecast) {
    if (forecast.length == 0) {
        return
    }

    const documentTitle = getDocumentTitle(forecast[0].timestamp);
    const config = configService.getConfig();

    const googleConfig = configService.getGoogleConfig();
    const serviceAccountAuth = new JWT ({
        email: googleConfig.client_email,
        key: googleConfig.private_key,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
        ]
});
    const doc = new GoogleSpreadsheet(config.spreadsheet[documentTitle], serviceAccountAuth);

    await doc.loadInfo();
    var sheet = doc.sheetsByIndex[0];

    await sheet.setHeaderRow(getHeaders(forecast));
    for (const data of forecast) {
        await sheet.addRow(getRow(data));
    }

}

function getDocumentTitle(timestamp) {
    const year = timestamp.getFullYear();
    return year + '';
}

function getHeaders(forecast) {
    const parameterHeaders = forecast[0].data
        .map(d => d.parameter);
    const result = ['timestamp'];
    result.push(...parameterHeaders);
    return result;
}

function getRow(data) {
    const values = data.data
        .map(d => {
            const obj = {};
            obj[d.parameter] = d.value;
            return obj;
        })
        .reduce((aggregate, obj) => Object.assign(aggregate, obj), {})
    return {
        timestamp: data.timestamp.toLocaleString('de-DE', { timeZone: 'Europe/Vienna' }),
        ...values
    };
}