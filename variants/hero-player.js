/* Hero-Video: Band (hero1) und Publikum (hero) abwechselnd in Zeitlupe mit Überblendung.
   Die Blende ist so getimt, dass sie exakt am Clip-Ende fertig ist – der auslaufende
   Clip wird nie über seinen Endpunkt hinaus gezeigt. */
(function () {
  var FADE = 900;       // Überblendung in ms (Echtzeit)
  var CLIPS = [
    { src: '../media/hero1.mp4', start: 0,    end: 10.6, rate: 0.35 },  // Band: langsamer
    { src: '../media/hero.mp4',  start: 12.4, end: null, rate: 0.5  }   // Publikum: bis zum Ende (null)
  ];
  var SAFETY = 0.08;                     // kleiner Puffer vor dem Schnitt

  document.querySelectorAll('video[src$="hero.mp4"]').forEach(function (first) {
    var second = first.cloneNode(false);
    second.removeAttribute('poster');
    second.style.position = 'absolute';
    second.style.inset = '0';
    second.style.width = '100%';
    second.style.height = '100%';
    first.insertAdjacentElement('afterend', second);

    var players = [first, second];
    var switching = false, active = 0;

    function seekTo(v, t) {
      if (Math.abs(v.currentTime - t) > 0.02) v.currentTime = t;
    }

    players.forEach(function (v, i) {
      var clip = CLIPS[i];
      v.loop = false;
      v.autoplay = false;
      v.preload = 'auto';
      v.muted = true;
      v.playsInline = true;
      v.playbackRate = clip.rate;
      v.style.transition = 'opacity ' + FADE + 'ms ease';
      v.style.opacity = i === 0 ? '1' : '0';
      v.src = clip.src;
      v.addEventListener('loadedmetadata', function () {
        if (clip.end === null) clip.end = v.duration;
        seekTo(v, clip.start);
      });
      v.addEventListener('ended', function () { if (i === active && !switching) swap(); });
    });

    // Präzise Überwachung des aktiven Clips (timeupdate ist zu grob)
    function watch() {
      var v = players[active], clip = CLIPS[active];
      var fadeVideo = FADE / 1000 * clip.rate;   // Blenddauer in Video-Sekunden
      if (!switching && clip.end !== null && v.currentTime >= clip.end - fadeVideo - SAFETY) swap();
      requestAnimationFrame(watch);
    }

    function swap() {
      switching = true;
      var cur = players[active], next = players[1 - active];
      seekTo(next, CLIPS[1 - active].start);
      next.playbackRate = CLIPS[1 - active].rate;
      var p = next.play();
      if (p && p.catch) p.catch(function () {});
      next.style.opacity = '1';
      cur.style.opacity = '0';
      setTimeout(function () {
        cur.pause();
        // Zurück auf den Clip-Anfang, solange unsichtbar – so steht das richtige Bild bereit
        seekTo(cur, CLIPS[active].start);
        active = 1 - active;
        switching = false;
      }, FADE);
    }

    var start = first.play();
    if (start && start.catch) start.catch(function () {});
    requestAnimationFrame(watch);
  });
})();
