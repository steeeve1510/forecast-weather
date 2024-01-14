const forecastService = require('./service/forecast-service');

(async () => {
  const today = new Date()
  const forecast = await forecastService.get(today);
  console.log(JSON.stringify(forecast, null, 2))
})();
