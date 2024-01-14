const configService = require('./config-service')

module.exports = { get };

const https = require('https');

const url = 'dataset.api.hub.geosphere.at';
const version = 'v1';
const type = 'timeseries';
const mode = 'forecast';

const resource = 'nwp-v1-1h-2500m';
const format = 'geojson';

// https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m/metadata
const parameters = [
  'cape',
  'cin',
  'grad',
  'mnt2m',
  'mxt2m',
  'rh2m',
  'rr_acc',
  'snow',
  'sp',
  'sundur_acc',
  't2m',
  'tcc',
  'u10m',
  'ugust',
  'v10m',
  'vgust'
];

function get(date) {

  const parametersString = parameters.join(',')

  const day = getDateString(date)
  const start = `${day}T00:00`;
  const end = `${day}T23:59`;

  const config = configService.getConfig();
  const latLon = config.latLon;

  const options = {
    hostname: url,
    path: `/${version}/${type}/${mode}/${resource}?parameters=${parametersString}&lat_lon=${latLon}&start=${start}&end=${end}&output_format=${format}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    let data = '';

    const request = https.request(options, (response) => {
      response.setEncoding('utf8');

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const obj = JSON.parse(data)
        const timestamps = getTimestamps(obj)
        const parameterValues = parameters.map(p => getValues(p, obj))

        const result = [];
        for (let i = 0; i < timestamps.length; i++) {
          const timestamp = timestamps[i];
          const valuesAtTime = parameterValues.map(p => p[i])
          const valuesObject = valuesAtTime.reduce(function (result, current) {
            return Object.assign(result, current);
          }, {});
          result.push({
            ...timestamp,
            ...valuesObject
          })
        }
        resolve(result);
      });
    });

    request.on('error', (error) => {
      reject(error);
      console.error(error);
    });

    request.end();
  })
}

function getDateString(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function getTimestamps(response) {
  const timestamps = response['timestamps'];
  return timestamps
    .map(t => new Date(t))
    .map(t => {
      const obj = {};
      obj['timestamp'] = t;
      return obj;
    });
}

function getValues(parameter, response) {
  const values = response['features'][0]['properties']['parameters'][parameter]
  const data = values['data']
  return data.map(d => {
    const obj = {};
    obj[parameter] = d;
    return obj;
  });
}
