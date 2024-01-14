const CronJob = require('cron').CronJob;
const configService = require('./service/config-service')
const forecastService = require('./service/forecast-service');

const config = configService.getConfig();
var job = new CronJob(
    config.cron,
    async () => await forecastService.forecast(),
    null,
    false,
    'Europe/Vienna'
);

(async () => {
    console.log('starting cron-job (' + config.cron + ')...')
    job.start();
})();
