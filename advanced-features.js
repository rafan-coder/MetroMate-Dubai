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

  // Online ratings are stored in Supabase. The publishable key is safe for browser use
  // when Row Level Security is enabled with the policies created for this table.
  const SUPABASE_URL = 'https://ksqjlqenfqdefththorr.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_83rmgJwqVrQso4EFMhi4nQ_dk1DxK_5';
  const SUPABASE_RATINGS_URL = `${SUPABASE_URL}/rest/v1/ratings`;
  const ratingFeedback = $('ratingFeedback');

  async function loadRatings() {
    try {
      const response = await fetch(`${SUPABASE_RATINGS_URL}?select=rating`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`Ratings request failed: ${response.status}`);
      const rows = await response.json();
      const ratings = rows.map(row => Number(row.rating)).filter(value => value >= 1 && value <= 5);
      const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
      if (ratingAverage) ratingAverage.textContent = ratings.length ? `${avg} ★` : '—';
      if (ratingCount) ratingCount.textContent = ratings.length ? `${ratings.length} online rating${ratings.length === 1 ? '' : 's'}` : 'No ratings yet';
    } catch (error) {
      console.error('MetroMate ratings:', error);
      if (ratingAverage) ratingAverage.textContent = '—';
      if (ratingCount) ratingCount.textContent = 'Ratings temporarily unavailable';
    }
  }

  function paintStars(value) {
    ratingStars.forEach((b, i) => b.classList.toggle('selected', i < value));
  }

  ratingStars.forEach((button) => button.addEventListener('click', () => {
    selectedRating = Number(button.dataset.rating);
    paintStars(selectedRating);
    if (ratingSubmit) ratingSubmit.disabled = false;
    if (ratingMessage) ratingMessage.textContent = `You selected ${selectedRating} star${selectedRating > 1 ? 's' : ''}.`;
  }));

  if (ratingSubmit) ratingSubmit.addEventListener('click', async () => {
    if (!selectedRating) return;
    ratingSubmit.disabled = true;
    if (ratingMessage) ratingMessage.textContent = 'Submitting your rating…';

    const feedback = ratingFeedback ? ratingFeedback.value.trim() : '';
    try {
      const response = await fetch(SUPABASE_RATINGS_URL, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          rating: selectedRating,
          feedback: feedback || null
        })
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Rating submission failed: ${response.status} ${detail}`);
      }

      if (ratingMessage) ratingMessage.textContent = 'Thanks — your rating was submitted online.';
      if (ratingFeedback) ratingFeedback.value = '';
      paintStars(0);
      selectedRating = 0;
      await loadRatings();
    } catch (error) {
      console.error('MetroMate rating submission:', error);
      if (ratingMessage) ratingMessage.textContent = 'Could not submit right now. Please try again.';
      ratingSubmit.disabled = false;
    }
  });

  loadRatings();
  window.addEventListener('resize', () => {
    const current = document.querySelector('#timeline .live-station.current');
    if (current && window.MetroMateAdvanced) window.MetroMateAdvanced.updateTrain([...stationItems()].indexOf(current));
  });
})();
