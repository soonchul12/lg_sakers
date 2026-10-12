(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const story = document.querySelector(".attendance-story");
  const stage = story.querySelector(".attendance-stage");
  const hero = document.querySelector(".court-paper");
  const active = new Set();
  const clamp = n => Math.max(0, Math.min(1, n));
  let frame = 0, selected = 0, manual = false;
  function choose(step) {
    selected = step;
    stage.dataset.step = step;
    document.querySelectorAll("[data-attendance-step]").forEach(el => { el.hidden = Number(el.dataset.attendanceStep) !== step; });
    document.querySelectorAll("[data-story-step]").forEach(el => el.setAttribute("aria-pressed", String(Number(el.dataset.storyStep) === step)));
    stage.querySelector(".story-position").textContent = `0${step + 1} / 03`;
  }
  document.querySelectorAll("[data-story-step]").forEach(button => button.addEventListener("click", () => {
    manual = true;
    choose(Number(button.dataset.storyStep));
    stage.style.setProperty("--story-growth", 1);
  }));
  function paint() {
    frame = 0;
    if (document.hidden) return;
    const calm = reduced.matches;
    for (const target of active) {
      const rect = target.getBoundingClientRect();
      if (target === story) {
        const distance = Math.max(1, rect.height - innerHeight);
        const progress = clamp((110 - rect.top) / distance);
        const canPin = !calm && innerHeight > 720 && !story.classList.contains("story-unpinned");
        if (!manual && canPin) {
          const next = Math.min(2, Math.floor(progress * 3));
          if (next !== selected) choose(next);
        }
        stage.style.setProperty("--story-growth", calm || manual || !canPin ? 1 : .45 + .55 * clamp(progress * 3));
      } else if (target === hero) {
        hero.style.setProperty("--court-drift", calm ? "0px" : `${Math.max(-16, Math.min(16, (innerHeight * .5 - rect.top) * .025))}px`);
      } else {
        const progress = calm ? 1 : clamp((innerHeight * .95 - rect.top) / (innerHeight * .55));
        target.style.setProperty("--chart-progress", progress);
      }
    }
  }
  function request() { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) active.add(entry.target); else active.delete(entry.target); });
    request();
  }, { rootMargin: "60px 0px" });
  observer.observe(story); observer.observe(hero);
  document.querySelectorAll(".chart-container svg, .chart-scroll svg, #teamRankingChart").forEach(svg => {
    svg.classList.add("scroll-chart");
    observer.observe(svg);
    let pending = false;
    function prepare() {
      pending = false;
      svg.querySelectorAll("path:not([stroke-dasharray])").forEach(path => {
        path.setAttribute("pathLength", "1");
        path.classList.add("scroll-line");
      });
      request();
    }
    new MutationObserver(() => { if (!pending) { pending = true; queueMicrotask(prepare); } }).observe(svg, {childList: true});
    prepare();
  });
  addEventListener("scroll", () => { manual = false; request(); }, {passive:true});
  function fit() {
    story.classList.remove("story-unpinned");
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    if (stage.offsetHeight > innerHeight - top - 16) story.classList.add("story-unpinned");
    request();
  }
  addEventListener("resize", fit, {passive:true});
  addEventListener("pageshow", request);
  document.addEventListener("visibilitychange", request);
  reduced.addEventListener("change", () => { stage.style.setProperty("--story-growth", 1); request(); });
  document.fonts.ready.then(fit);
  choose(0); fit();
})();
