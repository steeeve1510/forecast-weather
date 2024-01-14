const configService = require('../config-service')
const https = require('https');

module.exports = { getForecast };

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

function getForecast(date) {

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
        const result = mapToResult(obj)
        resolve(result);
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.end();
  })
}

function getDateString(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function mapToResult(obj) {
  const timestamps = getTimestamps(obj)
  const data = parameters.map(p => getData(p, obj))

  const result = [];
  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i];
    const dataAtTime = data
      .map(p => p[i])
    result.push({
      timestamp: timestamp,
      data: dataAtTime
    })
  }
  return result;
}

function getTimestamps(response) {
  const timestamps = response['timestamps'];
  return timestamps
    .map(t => new Date(t));
}

function getData(parameter, response) {
  const values = response['features'][0]['properties']['parameters'][parameter]
  const data = values['data']
  const name = values['name']
  const unit = values['unit']
  return data.map(d => {
   return{
      parameter: parameter,
      name: name,
      value: d,
      unit: unit
    };
  });
}
