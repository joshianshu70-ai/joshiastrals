const settings = await fetch('/launch-settings.json').then(r => r.json());
const root = document.getElementById('launchCountdown');
if (root && settings.launch_date && settings.launch_time) {
  const target = new Date(`${settings.launch_date}T${settings.launch_time}:00+05:30`);
  const fields = {
    days: document.getElementById('countdownDays'),
    hours: document.getElementById('countdownHours'),
    minutes: document.getElementById('countdownMinutes'),
    seconds: document.getElementById('countdownSeconds')
  };
  const status = document.getElementById('countdownStatus');
  const format = value => String(value).padStart(2, '0');
  let interval;
  const tick = () => {
    const remaining = Math.max(0, target.getTime() - Date.now());
    const seconds = Math.floor(remaining / 1000);
    fields.days.textContent = String(Math.floor(seconds / 86400));
    fields.hours.textContent = format(Math.floor(seconds % 86400 / 3600));
    fields.minutes.textContent = format(Math.floor(seconds % 3600 / 60));
    fields.seconds.textContent = format(seconds % 60);
    if (remaining === 0) {
      status.textContent = 'The scheduled start time has arrived. Check the official Drop for live availability.';
      root.setAttribute('aria-label', status.textContent);
      clearInterval(interval);
    }
  };
  tick();
  interval = setInterval(tick, 1000);
}
