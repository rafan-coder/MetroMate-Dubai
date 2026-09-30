/* MetroMate Advanced Experience Layer — visual + local UX features. */
(function () {
  const $ = (id) => document.getElementById(id);
  const train = $('movingTrain');
  const label = $('trainPositionLabel');
  const accuracy = $('gpsAccuracyValue');
  const speed = $('gpsSpeedValue');
  const nearest = $('gpsNearestValue');
  const signal = $('gpsSignalLabel');
  const progress = $('gpsProgressBar');
  const ratingStars = document.querySelectorAll('#ratingStars button');
  const ratingSubmit = $('ratingSubmit');
  const ratingAverage = $('ratingAverage');
  const ratingCount = $('ratingCount');
  const ratingMessage = $('ratingMessage');
  let selectedRating = 0;

  function stationItems() { return document.querySelectorAll('#timeline .live-station'); }

  window.MetroMateAdvanced = {
    updateTrain(index) {
      const items = stationItems();
      if (!train || !items.length) return;
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      const item = items[clamped];
      const stage = $('timelineStage');
      if (!stage || !item) return;
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const trainWidth = train.offsetWidth || 48;
      train.style.left = Math.max(8, itemCenter - trainWidth / 2) + 'px';
      train.classList.remove('train-arriving');
      void train.offsetWidth;
      train.classList.add('train-arriving');
      if (label) label.textContent = `Station ${clamped + 1} / ${items.length}`;
    },
    gps(position, nearestStation) {
      const c = position.coords;
      if (accuracy) accuracy.textContent = Number.isFinite(c.accuracy) ? `${Math.round(c.accuracy)} m` : '—';
      if (speed) speed.textContent = Number.isFinite(c.speed) && c.speed >= 0 ? `${Math.round(c.speed * 3.6)} km/h` : '—';
      if (nearest) nearest.textContent = nearestStation || 'Scanning…';
      if (signal) signal.textContent = c.accuracy <= 50 ? 'Excellent' : c.accuracy <= 150 ? 'Good' : 'Weak';
      if (progress) progress.style.width = `${Math.max(8, Math.min(100, 100 - ((c.accuracy || 200) / 2)))}%`;
    },
    gpsStandby(message) {
      if (signal) signal.textContent = message || 'Standby';
    }
  };

  function loadRatings() {
    let data;
    try { data = JSON.parse(localStorage.getItem('metromate-ratings') || '[]'); } catch { data = []; }
    const avg = data.length ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(1) : '—';
    if (ratingAverage) ratingAverage.textContent = data.length ? `${avg} ★` : '—';
    if (ratingCount) ratingCount.textContent = data.length ? `${data.length} local rating${data.length === 1 ? '' : 's'}` : 'No ratings yet';
  }
  function paintStars(value) { ratingStars.forEach((b, i) => b.classList.toggle('selected', i < value)); }
  ratingStars.forEach((button) => button.addEventListener('click', () => {
    selectedRating = Number(button.dataset.rating);
    paintStars(selectedRating);
    if (ratingSubmit) ratingSubmit.disabled = false;
    if (ratingMessage) ratingMessage.textContent = `You selected ${selectedRating} star${selectedRating > 1 ? 's' : ''}.`;
  }));
  if (ratingSubmit) ratingSubmit.addEventListener('click', () => {
    if (!selectedRating) return;
    let data;
    try { data = JSON.parse(localStorage.getItem('metromate-ratings') || '[]'); } catch { data = []; }
    data.push(selectedRating);
    localStorage.setItem('metromate-ratings', JSON.stringify(data.slice(-100)));
    loadRatings();
    ratingMessage.textContent = 'Thanks — your rating was saved on this device.';
    ratingSubmit.disabled = true;
  });
  loadRatings();
  window.addEventListener('resize', () => {
    const current = document.querySelector('#timeline .live-station.current');
    if (current && window.MetroMateAdvanced) window.MetroMateAdvanced.updateTrain([...stationItems()].indexOf(current));
  });
})();
