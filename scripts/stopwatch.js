let startTime = 0;
let timer;
let elapsedTime = 0;
let isRunning =  false;
let lapClicks = [];

document.querySelector('.js-lap').style.display = 'none';
document.querySelector('.js-laps-container').classList.remove('lap-toggled');

document.querySelector('.js-start').addEventListener('click', () => {
  if(!isRunning) {
    startTime = Date.now() - elapsedTime;
    timer = setInterval(updateDisplay, 10);
    isRunning = true;

    document.querySelector('.js-lap').style.display = 'block';
    document.querySelector('.js-lap').addEventListener('click', () => {
      document.querySelector('.js-laps-container').classList.add('lap-toggled');
      document.querySelector('.js-laps').textContent = 'Lap';
      document.querySelector('.js-lap-times').textContent = 'Lap times';
      
      const lapClick = Date.now() - startTime;
      lapClicks.push(lapClick);
      const lapTimes = getLapTime(lapClicks);
      lapTimeHTML(lapTimes);
      overAllTimeHtml();
    });
  }
});

document.querySelector('.js-stop').addEventListener('click', () => {
  if(isRunning){
    clearInterval(timer);
    elapsedTime = Date.now() - startTime;
    document.querySelector('.js-lap').style.display = 'none';
    document.querySelector('.js-start').textContent = 'RESUME';
    isRunning = false;
  }
});

document.querySelector('.js-reset').addEventListener('click', () => {
  clearInterval(timer);
  window.location.reload();
});

function updateDisplay() {
  const currentTime = Date.now();
  elapsedTime = currentTime - startTime;
  document.querySelector('.js-clock').textContent = getTimeString(elapsedTime);
}


function getLapTime(lapClicks){
  let lapTimes = [];

  lapClicks.forEach((value, i, array) => {
    if(array[i - 1]){
      let lapTime = value - array[i -1];
      lapTimes.push(lapTime);
    }
    else{
      lapTimes.push(value);
    }
  })

  return lapTimes;
}

function lapTimeHTML(lapTimes){
  let laps = 1;

  let lapCountHtml = '';
  let laptimesHtml = '';

  console.log(document.querySelector('.js-laps'));
  lapTimes.forEach(lapTime => {
    lapCountHtml += `<span>${laps}</span>`;
    laptimesHtml += `<span>${getTimeString(lapTime)}</span>`;
    laps += 1;
  });
     
  document.querySelector('.js-laps').innerHTML += lapCountHtml;

  document.querySelector('.js-lap-times').innerHTML += laptimesHtml;
}

function addPad(value){
  return String(value).padStart(2, 0);
}

function getTimeString(time){
  const hours = Math.floor( time / (3600 * 1000));
  const minutes = Math.floor( time / (60 * 1000) % 60);
  const seconds = Math.floor( time / 1000 % 60);
  const milliSeconds = Math.floor( time % 1000 / 10);

  return `${addPad(hours)}:${addPad(minutes)}:${addPad(seconds)}:${addPad(milliSeconds)}`
}

function overAllTimeHtml(){
  const currentTime = Date.now();
  elapsedTime = currentTime - startTime;

  const html = getTimeString(elapsedTime);

  document.querySelector('.js-overall-time').innerHTML += `<span>${html}</span>`;
}