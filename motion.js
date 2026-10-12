(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const story = document.querySelector(".attendance-story");
  const stage = story.querySelector(".attendance-stage");
  const hero = document.querySelector(".court-paper");
  const strategy = document.querySelector(".strategy");
  const strategyStage = strategy.querySelector(".wrap");
  const strategyButtons = [...document.querySelectorAll("[data-strategy]")];
  strategyStage.classList.add("strategy-stage");
  strategy.classList.add("strategy-story");
  const rail = document.createElement("div");
  rail.className = "scene-rail";
  rail.setAttribute("aria-hidden", "true");
  rail.append(document.createElement("i"));
  stage.append(rail.cloneNode(true));
  strategyStage.append(rail);
  const active = new Set();
  const clamp = n => Math.max(0, Math.min(1, n));
  let frame = 0, selected = 0, manual = false, strategyManual = false, automatic = false;
  strategyButtons.forEach(button => button.addEventListener("click", () => {
    if (!automatic) strategyManual = true;
  }));
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
        const inset = parseFloat(getComputedStyle(stage).top) || 0;
        const distance = Math.max(1, rect.height - stage.offsetHeight);
        const progress = clamp((inset - rect.top) / distance);
        const canPin = !calm && innerHeight > 560;
        if (!manual && canPin) {
          const next = Math.min(2, Math.floor(progress * 3));
          if (next !== selected) choose(next);
        }
        const still = calm || manual || !canPin;
        stage.style.setProperty("--scene-progress", still ? 1 : progress);
        stage.style.setProperty("--story-growth", still ? 1 : .04 + .96 * clamp(progress / .85));
        stage.style.setProperty("--weekday-growth", still ? 1 : .04 + .96 * clamp((progress - .18) / .5));
        stage.style.setProperty("--weekend-growth", still ? 1 : .04 + .96 * clamp((progress - .32) / .52));
        stage.style.setProperty("--intro-scale", still ? 1 : 1.12 - .12 * clamp(progress * 2));
        stage.style.setProperty("--intro-rise", still ? "0px" : `${24 * (1-clamp(progress*3))}px`);
        stage.style.setProperty("--gap-reveal", still ? 1 : clamp((progress - .61) / .24));
      } else if (target === strategy) {
        const inset = parseFloat(getComputedStyle(strategyStage).top) || 0;
        const progress = clamp((inset - rect.top) / Math.max(1, rect.height - strategyStage.offsetHeight));
        strategyStage.style.setProperty("--scene-progress", calm ? 1 : progress);
        if (!calm && !strategyManual && innerHeight > 560) {
          const step = Math.min(3, Math.floor(progress * 4));
          const button = strategyButtons[step];
          if (button.getAttribute("aria-pressed") !== "true") {
            automatic = true; button.click(); automatic = false;
          }
          const phase = progress * 4 - step;
          strategyStage.style.setProperty("--proposal-rise", `${30 * (1 - clamp(phase * 4))}px`);
          strategyStage.style.setProperty("--proposal-scale", .94 + .06 * clamp(phase * 4));
        } else {
          strategyStage.style.setProperty("--proposal-rise", "0px");
          strategyStage.style.setProperty("--proposal-scale", 1);
        }
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
  observer.observe(story); observer.observe(hero); observer.observe(strategy);
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
  addEventListener("scroll", () => { manual = false; strategyManual = false; request(); }, {passive:true});
  function fit() {
    story.classList.remove("story-unpinned");
    request();
  }
  addEventListener("resize", fit, {passive:true});
  addEventListener("pageshow", request);
  document.addEventListener("visibilitychange", request);
  reduced.addEventListener("change", () => { stage.style.setProperty("--story-growth", 1); request(); });
  document.fonts.ready.then(fit);
  choose(0); fit();
})();
