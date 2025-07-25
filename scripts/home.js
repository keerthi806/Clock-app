
let intervalId;
let meridianId;

window.addEventListener('load', () => {
  intervalId = setInterval(updateTime, 300);
});

document.querySelector('.js-change-format').addEventListener('click', () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    meridianId = setInterval(meridianTime, 300);
  } else if (meridianId) {
    clearInterval(meridianId);
    meridianId = null;
    intervalId = setInterval(updateTime, 300);
  }


});

function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, 0);
  const minutes = String(now.getMinutes()).padStart(2, 0);
  const seconds = String(now.getSeconds()).padStart(2, 0);
  const date = String(now.getDate()).padStart(2, 0);
  const { month, day } = getMonthAndDay(now);
  const { timezone, offsetString } = getTimezone(now);

  document.querySelector('.js-clock').textContent =
    `${hours}:${minutes}:${seconds}`;

  document.querySelector('.js-info').innerHTML = `
      <div class="offset">${offsetString}</div>
      <div class="timezone">${timezone}</div>
      <div class="day-info">${day},&nbsp;${month}-${date}</div>
  `;
}

function meridianTime() {
  const now = new Date();
  const hours = String(now.getHours() % 12 || 12).padStart(2, 0);
  const minutes = String(now.getMinutes()).padStart(2, 0);
  const seconds = String(now.getSeconds()).padStart(2, 0);
  const meridian = now.getHours() > 12 ? 'PM' : 'AM';
  const date = String(now.getDate()).padStart(2, 0);
  const { month, day } = getMonthAndDay(now);
  const { timezone, offsetString } = getTimezone(now);

  document.querySelector('.js-clock').textContent =
    `${hours}:${minutes}:${seconds} ${meridian}`;

  document.querySelector('.js-info').innerHTML = `
  <div class="offset">${offsetString}</div>
  <div class="timezone">${timezone}</div>
  <div class="day-info">${day},&nbsp;${month}-${date}</div>
`;
}

function getTimezone(time) {
  const timezone = time.toString().split('(')[1].split(')')[0].trim();
  const offset = time.getTimezoneOffset() / 60;
  const offsetString = offset < 0 ? `UTC + ${Math.abs(offset)}` : `UTC - ${Math.abs(offset)}`;

  return { timezone, offsetString };
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
