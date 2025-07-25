const timeApiKey = 'ddd922e63ad846a7928dda74d1c6bc6c';
const weatherApiKey = 'b923ad656c0ddc07d8ee6b9ea3044d94';
let errorTimeoutId;
const clockIntervalIds = {};
let unixEpochId;

window.addEventListener('load', () => {
  renderAddedCities();

  setInterval(() => {
    const now = new Date;
    const { timeString, dateString } = updateTime(now);
    const timezone = now.toString().split('(')[1].split(')')[0].trim();

    document.querySelector('.js-current-time').textContent = timeString.slice(0, 5);

    document.querySelector('.js-current-day').innerHTML = dateString;

    document.querySelector('.js-timezone').textContent = timezone;
  }, 100);
});

document.querySelector('.js-search').addEventListener('click', () => {
  clearInterval(clockIntervalIds['search']);
  delete clockIntervalIds['search'];
  console.log(clockIntervalIds);
  clearTimeout(errorTimeoutId);
  const cityName = document.querySelector('.js-city-name').value;
  if (cityName === '') {
    handleErrors('Please check the location name');
    return;
  }
  fetchData(cityName).then((data) => {
    updateInfo(data);
    document.querySelector('.js-city-name').value = '';
    document.querySelector('.js-info').style.display = 'flex';
  }).catch(error => {
    handleErrors('Unable to fetch data. Please check the location');
    console.log(error);
  });
});

document.querySelector('.js-city-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    document.querySelector('.js-search').click();
  }
});

async function fetchData(cityName) {
  const { lat, lng } = await getCoordinates(cityName);

  const timeResponse = await fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=OTDIGV9MBBEG&format=json&by=position&lat=${lat}&lng=${lng}`);

  const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherApiKey}`);

  if (!timeResponse.ok || !weatherResponse.ok) {
    if (timeResponse.status === 400 || weatherResponse.status === 404) {
      handleErrors('Bad request. Please check the location name')
      throw new Error('Bad request');
    }
    handleErrors('Unable to fetch data');
    throw new Error('Unable to fetch data');
  }

  const timeData = await timeResponse.json();
  const weatherData = await weatherResponse.json();

  // console.log({timeData, weatherData});
  return { timeData, weatherData };
}

async function getCoordinates(name) {
  const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${name}&key=7049a1a7786149fcb7a62e6119af499c`);

  const data = await response.json();

  return data.results[0].geometry;
}

function handleErrors(errorMessage) {
  const errorDisplay = document.querySelector('.js-error-display');
  errorDisplay.style.opacity = '1';
  errorDisplay.textContent = errorMessage.toUpperCase();

  errorTimeoutId = setTimeout(() => {
    errorDisplay.style.opacity = '0';
  }, 2500);
}

function updateInfo(data) {
  const { timeData, weatherData } = data;

  const {
    formatted: dateTime,
    gmtOffset,
    abbreviation: timezone,
    countryName: country
  } = timeData

  const {
    name,
    main: { temp: temperature },
    weather: [{ id }]
  } = weatherData;

  const isoString = dateTime.replace(' ', 'T');

  const dateObject = new Date(isoString);

  const { timeString, dateString } = updateTime(dateObject);

  let dataHtml = `
    <div class="name">
      <div class="city-name">${name.toUpperCase()},&nbsp;${country.toUpperCase()} </div>
    </div>
    
    <div class="city-info">
      <div class="time js-time">${timeString}</div>
      <div class="date">${dateString}</div>
    </div>

    <div class="city-data">
      <div class="timezone">
        <div class="time-difference">${computeTimeDifference(gmtOffset)}</div>
        <div class="zone-name"><a href="https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations" class="timezone-link" target="_blank">${timezone}</a></div>
      </div>
      <div class="weather-data">
        <div class="weather-emoji">${getWeatherEmoji(id)}</div>
        <div class="temp">${(temperature - 273.15).toFixed(2)}°C</div>
      </div>
    </div>

    <button class="add-city js-add-city">+</button>
  `;

  document.querySelector('.js-info').innerHTML = dataHtml;

  updateQueryTime(isoString, '.js-time', 'search');

  document.querySelector('.js-add-city').addEventListener('click', () => {
    const addedcities = JSON.parse(localStorage.getItem('cities')) || [];
    if (addedcities.includes(name)) {
      handleErrors('Already exists');
      return;
    } else {
      addedcities.push(name);
      localStorage.setItem('cities', JSON.stringify(addedcities));
    }
    renderAddedCities();
  });
}

function getWeatherEmoji(weatherId) {
  switch (true) {
    case (weatherId >= 200 && weatherId < 300):
      return "⚡⛈️";
    case (weatherId >= 300 && weatherId < 400):
      return "🌧️";
    case (weatherId >= 500 && weatherId < 600):
      return "🌧️";
    case (weatherId >= 600 && weatherId < 700):
      return "❄️";
    case (weatherId >= 700 && weatherId < 800):
      return "🌫️";
    case (weatherId === 800):
      return "☀️";
    case (weatherId >= 801 && weatherId < 810):
      return "☁️";
    default:
      return "❓";
  }
}

function getMonthAndDay(time) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];

  const month = monthNames[time.getMonth()];
  const day = daysOfWeek[time.getDay()];

  return { month, day };
}

function updateTime(time) {
  const hours = String(time.getHours()).padStart(2, 0);
  const minutes = String(time.getMinutes()).padStart(2, 0);
  const seconds = String(time.getSeconds()).padStart(2, 0);
  const date = String(time.getDate()).padStart(2, 0);
  const { month, day } = getMonthAndDay(time);

  const timeString = `${hours}:${minutes}:${seconds}`;
  const dateString = `${day},&nbsp;${month}-${date}`;

  return { timeString, dateString };
}

function updateQueryTime(isoString, element, id) {
  let unixEpoch = new Date(isoString).getTime();

  clearInterval(clockIntervalIds[id]);

  clockIntervalIds[id] = setInterval(() => {
    const time = new Date(unixEpoch);

    const hours = String(time.getHours()).padStart(2, 0);
    const minutes = String(time.getMinutes()).padStart(2, 0);
    const seconds = String(time.getSeconds()).padStart(2, 0);

    document.querySelector(element).textContent = `${hours}:${minutes}:${seconds}`;

  }, 100);

  unixEpochId = setInterval(() => {
    unixEpoch += 1000;
  }, 1000);
}

function computeTimeDifference(gmtOffset) {
  const currentOffset = Math.abs(new Date().getTimezoneOffset() * 60);

  const difference = gmtOffset - currentOffset;

  if (difference === 0) {
    return 'Same time zone';
  } else if (difference > 0) {
    return `${Math.abs(Math.floor(difference / 3600))} hours ${Math.abs(Math.floor(difference / 60) % 60)} minutes ahead`;
  } else {
    return `${Math.abs(Math.ceil(difference / 3600))} hours ${Math.abs(Math.ceil(difference / 60) % 60)} minutes behind`;
  }
}

async function renderAddedCities() {
  const addedcities = JSON.parse(localStorage.getItem('cities')) || [];

  let addedcitiesHTML = '';

  for (let i = 0; i < addedcities.length; i++) {
    const { timeData, weatherData } = await fetchData(addedcities[i]);

    const {
      formatted: dateTime,
      gmtOffset,
      abbreviation: timezone,
      countryName: country
    } = timeData

    const {
      name,
      main: { temp: temperature },
      weather: [{ id }]
    } = weatherData;

    const isoString = dateTime.replace(' ', 'T');

    const dateObject = new Date(isoString);

    const { timeString, dateString } = updateTime(dateObject);

    addedcitiesHTML += `
      <div class="added-city js-added-city-${name}">
        <div class="name">
          <div class="city-name">${name.toUpperCase()},&nbsp;${country.toUpperCase()} </div>
        </div>
        
        <div class="city-info">
          <div class="time js-time-${name}">${timeString.slice(0, 5)}</div>
          <div class="date">${dateString}</div>
        </div>

        <div class="city-data">
          <div class="timezone">
            <div class="time-difference">${computeTimeDifference(gmtOffset)}</div>
            <div class="zone-name"><a href="https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations" class="timezone-link" target="_blank">${timezone}</a></div>
          </div>
          <div class="weather-data">
            <div class="weather-emoji">${getWeatherEmoji(id)}</div>
            <div class="temp">${(temperature - 273.15).toFixed(2)}°C</div>
          </div>
        </div>

        <button class="delete-city js-delete-city" data-city-name="${name}">-</button>
      </div>
    `;

    updateQueryTime(isoString, `.js-time-${name}`, name);
  }

  document.querySelector('.js-added-cities').innerHTML = addedcitiesHTML;

  const dltBtns = document.querySelectorAll('.js-delete-city');

  if (dltBtns) {
    dltBtns.forEach(dltBtn => {
      dltBtn.addEventListener('click', () => {
        deleteCity(dltBtn.dataset.cityName, dltBtn.dataset.cityName);
      });
    });
  }
}

function deleteCity(name, id) {
  const addedcities = JSON.parse(localStorage.getItem('cities'));

  const updatedCities = addedcities.filter(city => city !== name);

  localStorage.setItem('cities', JSON.stringify(updatedCities));

  clearInterval(clockIntervalIds[id]);
  delete clockIntervalIds[id];
  // console.log(clockIntervalIds);

  renderAddedCities();
}