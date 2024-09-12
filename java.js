const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current');
const timezoneEl = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

// Days and months arrays
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Function to update time and date every second
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

// Function to fetch weather data from Open-Meteo API
function getWeatherData() {
    navigator.geolocation.getCurrentPosition((success) => {
        let { latitude, longitude } = success.coords;

        // Fetch weather data
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=sunrise,sunset,temperature_2m_min,temperature_2m_max&timezone=auto&current_weather=true`)
            .then(res => res.json())
            .then(data => {
                showWeatherData(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });

        // Reverse Geocoding to get city and country
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then(res => res.json())
            .then(data => {
                const city = data.address.city || data.address.town || data.address.village;
                const country = data.address.country;
                countryEl.innerHTML = `${city}, ${country}`;
            })
            .catch(error => {
                console.error('Error fetching location data:', error);
                countryEl.innerHTML = 'Location Unavailable';
            });
    });
}

// Function to display weather data in HTML
function showWeatherData(data) {
    const currentWeather = data.current_weather;
    const dailyWeather = data.daily;

    // Update timezone and country
    timezoneEl.innerHTML = data.timezone;

    // Update current weather details (humidity, pressure, wind speed, etc.)
    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${data.hourly.relative_humidity_2m[0]}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${currentWeather.pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${currentWeather.windspeed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${new Date(dailyWeather.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div class="weather-item">
            <div>Sunset</div>
            <div>${new Date(dailyWeather.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;

    // Update current temperature and forecast
    currentTempEl.innerHTML = `
        <img src="http://openweathermap.org/img/wn/10d@2x.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="day">${days[new Date().getDay()]}</div>
            <div class="temp">Night - ${dailyWeather.temperature_2m_min[0]}&#176;C</div>
            <div class="temp">Day - ${dailyWeather.temperature_2m_max[0]}&#176;C</div>
        </div>
    `;

    // Update weather forecast for next few days
    let otherDayForecast = '';
    for (let i = 1; i < 7; i++) {
        otherDayForecast += `
            <div class="weather-forecast-item">
                <div class="day">${days[new Date(dailyWeather.time[i]).getDay()]}</div>
                <img src="http://openweathermap.org/img/wn/10d@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">Night - ${dailyWeather.temperature_2m_min[i]}&#176;C</div>
                <div class="temp">Day - ${dailyWeather.temperature_2m_max[i]}&#176;C</div>
            </div>
        `;
    }
    weatherForecastEl.innerHTML = otherDayForecast;
}

// Call function to get weather data
getWeatherData();
