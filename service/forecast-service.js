const geosphereService = require('./core/geosphere-service')
const storeService = require('./core/store-service')

module.exports = { forecast }

const maxAttempts = 10;

async function forecast() {
  const today = new Date();
  let success = false;
  for (let i = 1; i <= maxAttempts && !success; i++) {
    try {
      await forecastAttempt(today, i);
      success = true
    } catch (e) {
      console.error("Could not store forecast: " + e.message);
    }
  }
}

async function forecastAttempt(date, attempt) {
  const attemptString = `(${attempt}/${maxAttempts})`

  console.log(`getting forecast for ${date.toLocaleDateString('de-at')} ${attemptString}...`)
  const forecast = await geosphereService.getForecast(date);

  console.log(`storing forecast ${attemptString}...`)
  await storeService.store(forecast);

  console.log(`forecast stored ${attemptString}`);
}