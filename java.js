const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + `<span id="am-pm">${ampm}</span>`;

    dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month];

}, 1000);

getWeatherData();

function getWeatherData() {
    navigator.geolocation.getCurrentPosition(
        (success) => {
            const { latitude, longitude } = success.coords;
            console.log(lat,long)
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=c3cb361a5537e857517e24dd408258cb`)
                .then(res => res.json())
                .then(data => {
                    showWeatherData(data);
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                });
        },
        (error) => {
            console.error('Error getting geolocation:', error);
        }
    );
}

function showWeatherData(data) {
    console.log(data);

    if (!data) {
        console.error('No weather data available.');
        return;
    }

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = data.name + ', ' + data.sys.country;

    currentWeatherItemsEl.innerHTML =
        `<div class="weather-item">
            <div>Humidity: ${data.main.humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure: ${data.main.pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed: ${data.wind.speed} m/s</div>
        </div>

        <div class="weather-item">
            <div>Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</div>
        </div>
        <div class="weather-item">
            <div>Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</div>
        </div>`;

    let otherDayForecast = '';
    data.daily.forEach((day, idx) => {
        if (idx === 0) {
            currentTempEl.innerHTML = `
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="weather icon" class="w-icon">
                <div class="other">
                    <div class="day">${moment(day.dt * 1000).format('dddd')}</div>
                    <div class="temp">Night - ${day.temp.night}&#176;C</div>
                    <div class="temp">Day - ${day.temp.day}&#176;C</div>
                </div>`;
        } else {
            otherDayForecast += `
                <div class="weather-forecast-item">
                    <div class="day">${moment(day.dt * 1000).format('ddd')}</div>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="weather icon" class="w-icon">
                    <div class="temp">Night - ${day.temp.night}&#176;C</div>
                    <div class="temp">Day - ${day.temp.day}&#176;C</div>
                </div>`;
        }
    });

    weatherForecastEl.innerHTML = otherDayForecast;
}
