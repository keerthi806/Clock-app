let secondsHtml = '';
let minutesHtml = '';
let hoursHtml = '';
let intervalId;
let clockId;
let timeoutId;
let inputTimeout;
let progressId;
let elapsedTime = 0;
let inputId;

for (let i = 0; i <= 59; i++) {
  secondsHtml += `<div class="js-seconds">${String(i).padStart(2, 0)}</div>`;
  minutesHtml += `<div class="js-minutes">${String(i).padStart(2, 0)}</div>`;
}

for (let i = 0; i <= 23; i++) {
  hoursHtml += `<div class="js-hours">${String(i).padStart(2, 0)}</div>`;
}

const padHtml = `
  <div class="pad-item"></div>
  <div class="pad-item"></div>
`;

document.querySelector('.started').style.display = 'none';

document.querySelector('.js-seconds-list').innerHTML = secondsHtml;
document.querySelector('.js-minutes-list').innerHTML = minutesHtml;
document.querySelector('.js-hours-list').innerHTML = hoursHtml;

document.querySelector('.js-seconds').classList.add('selected-seconds');
document.querySelector('.js-minutes').classList.add('selected-minutes');
document.querySelector('.js-hours').classList.add('selected-hours');

document.querySelectorAll('.list').forEach(list => {
  list.innerHTML += padHtml;
});


document.querySelectorAll('.values').forEach(value => {
  value.addEventListener('scroll', (e) => {
    let scrollingValue;
    let target = e.target.classList;
    if (target.contains('hours-container')) {
      scrollingValue = 'hours';
    } else if (target.contains('minutes-container')) {
      scrollingValue = 'minutes';
    } else if (target.contains('seconds-container')) {
      scrollingValue = 'seconds';
    }

    getSelectedValue(e, scrollingValue);
  });
});

document.querySelectorAll('.values').forEach(value => {
  value.addEventListener('wheel', e => {
    e.preventDefault();
    const sensitivity = 0.5;
    value.scrollTop += e.deltaY * sensitivity;
  }, { passive: false });
});

document.querySelector('.js-start-button').addEventListener('click', () => {
  clearTimeout(timeoutId);
  clearTimeout(inputId);
  startTimer(getTotalTime());
});

document.querySelector('.js-delete-button').addEventListener('click', () => {
  window.location.reload();
});

document.querySelector('.js-pause-button').addEventListener('click', () => {
  const pauseButton = document.querySelector('.js-pause-button');
  if (pauseButton.textContent.includes('Pause')) {
    clearInterval(intervalId);
    clearInterval(clockId);
    clearInterval(progressId);
    document.querySelector('.js-pause-button').textContent = 'Resume';
    document.querySelector('.js-pause-button').style.backgroundColor = 'hsl(10, 90%, 61%)';
  } else {
    const pauseTimeString = document.querySelector('.clock-container').textContent;
    const times = pauseTimeString.split(':');
    const hours = Number(times[0]);
    const minutes = Number(times[1]);
    const seconds = Number(times[2]);

    const remainingTime = (hours * 3600) + (minutes * 60) + seconds;
    startInterval(remainingTime);
    document.querySelector('.js-pause-button').textContent = 'Pause';
    document.querySelector('.js-pause-button').style.backgroundColor = 'hsl(255, 78%, 46%)';
  }
});

document.querySelectorAll('.preset-value').forEach((preset) => {
  preset.addEventListener('click', () => {
    const [min, sec] = preset.textContent.split(':').map(Number);

    scrollToIndex('.js-hours-list', 0);
    scrollToIndex('.js-minutes-list', min);
    scrollToIndex('.js-seconds-list', sec);
  });
});

document.querySelectorAll('.js-input').forEach(inputElement => {
  inputElement.addEventListener("keydown", () => {
      inputId = setTimeout(inputHandler, 1000);
  });

  inputElement.addEventListener('click', () => {
    inputId = setTimeout(inputHandler, 200);
  });
});

function getSelectedValue(e, scrollingValue) {
  const currentElements = document.querySelectorAll(`.js-${scrollingValue}`);
  let index = Math.round(e.target.scrollTop / 40);
  currentElements.forEach(sec => {
    sec.classList.remove(`selected-${scrollingValue}`);
  });
  currentElements[index].classList.add(`selected-${scrollingValue}`);
}

function updateClock(totalSeconds) {
  const hours = String(Math.floor((totalSeconds / 3600) % 60)).padStart(2, 0);
  const minutes = String(Math.floor((totalSeconds / 60) % 60)).padStart(2, 0);
  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, 0);

  return `${hours}:${minutes}:${seconds}`;
}

function startTimer(totalSeconds) {
  if (totalSeconds === 0) return;
  document.querySelector('.js-start-button').style.display = 'none';
  document.querySelector('.started').style.display = 'flex';
  document.querySelector('.input-container').style.opacity = '0';

  updateClock(totalSeconds);
  startInterval(totalSeconds);
}

function startInterval(totalSeconds) {
  const circle = document.getElementById('progress-bar');

  const strokeLength = circle.getTotalLength();
  circle.style.strokeDasharray = strokeLength;

  const totalTime = getTotalTime();

  progressId = setInterval(() => {
    if (totalSeconds >= 0) {
      const progress = elapsedTime / totalTime;
      circle.style.strokeDashoffset = strokeLength * progress;
      if(totalSeconds <= 3) {
        circle.style.stroke = 'hsla(0, 88.10%, 50.40%, 0.87)';
      }
    } else {
      clearInterval(progressId);
    }
  }, 100);

  intervalId = setInterval(() => {
    document.querySelector('.js-clock').textContent = updateClock(totalSeconds);
    if (totalSeconds < 0) {
      const circle = document.getElementById('progress-bar');
      circle.style.stroke = circle.style.opacity = '0';
      document.querySelector('.js-clock').classList.add('time-up');
      document.querySelector('.js-clock').textContent = "TIME'S UP!";
      document.querySelector('.started').style.display = 'none';
      scrollToIndex('.js-hours-list', 0);
      scrollToIndex('.js-minutes-list', 0);
      scrollToIndex('.js-seconds-list', 0);
      clearInterval(intervalId);
      timeoutId = setTimeout(() => {
        document.querySelector('.js-delete-button').click();
      }, 4000);
      return;
    };
  }, 300);

  clockId = setInterval(() => {
    totalSeconds -= 1;
    elapsedTime += 1;
  }, 1000);
}

function scrollToIndex(listSelector, index) {
  const list = document.querySelector(listSelector);
  const container = list.parentElement;
  const itemHeight = list.querySelector('div')?.offsetHeight || 0;

  container.scrollTo({
    top: itemHeight * index,
    behavior: 'smooth'
  });
}

function getTotalTime(){
  const hours = Number(document.querySelector('.selected-hours').textContent);
  const minutes = Number(document.querySelector('.selected-minutes').textContent);
  const seconds = Number(document.querySelector('.selected-seconds').textContent);

  return (hours * 3600) + (minutes * 60) + seconds;
}

function inputHandler(){
  const hours = document.querySelector('.js-hours-input').value;
  const minutes = document.querySelector('.js-minutes-input').value;
  const seconds = document.querySelector('.js-seconds-input').value;
  
  scrollToIndex('.js-hours-list', hours);
  scrollToIndex('.js-minutes-list', minutes);
  scrollToIndex('.js-seconds-list', seconds);
}