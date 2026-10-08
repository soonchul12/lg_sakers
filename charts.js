(() => {
  "use strict";
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg",
    red = "#c92e43",
    sage = "#718177",
    ink = "#242522";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fmt = (n) => Math.round(n).toLocaleString("ko-KR");
  const mean = (rows) =>
    rows.length ? rows.reduce((s, g) => s + g.관중수, 0) / rows.length : 0;
  function el(tag, attrs = {}, text) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function label(svg, x, y, text, attrs = {}) {
    svg.append(
      el(
        "text",
        {
          x,
          y,
          fill: "#6b6d65",
          "font-size": 13,
          "font-family": "Noto Sans KR, sans-serif",
          ...attrs,
        },
        text,
      ),
    );
  }
  function frame(svg, max, rows = 5) {
    svg.replaceChildren();
    if (svg.id === "crowdChart") {
      const width =
        innerWidth < 761 ? Math.max(260, svg.parentElement.clientWidth) : 900;
      svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${innerWidth < 761 ? 280 : 320}`,
      );
    }
    const box = svg.viewBox.baseVal,
      w = box.width,
      h = box.height;
    const left = 52,
      right = w - 22,
      top = 25,
      bottom = h - 46;
    const y = (v) => bottom - (v / max) * (bottom - top);
    for (let i = 0; i <= rows; i++) {
      const v = (max / rows) * i;
      svg.append(
        el("line", {
          x1: left,
          x2: right,
          y1: y(v),
          y2: y(v),
          stroke: "#d5d9cd",
          "stroke-dasharray": i ? "3 6" : "none",
        }),
      );
      label(
        svg,
        left - 12,
        y(v) + 4,
        v >= 1000 ? (v / 1000).toLocaleString("ko-KR") + "k" : fmt(v),
        { "text-anchor": "end", "font-size": 12 },
      );
    }
    return { w, h, left, right, top, bottom, y };
  }
  function bars(svg, labels, series, opts = {}) {
    const maximum = Math.max(
      1,
      ...series.flatMap((s) => s.values.filter(Number.isFinite)),
    );
    const max = Math.ceil(maximum / 1000) * 1000;
    const f = frame(svg, max);
    const cell = (f.right - f.left) / labels.length;
    labels.forEach((text, i) => {
      const skip = labels.length > 9 ? Math.ceil(labels.length / 7) : 1;
      if (i % skip === 0 || i === labels.length - 1)
        label(svg, f.left + cell * (i + 0.5), f.bottom + 25, text, {
          "text-anchor": "middle",
          "font-size": 12,
        });
      series.forEach((s, j) => {
        const value = s.values[i];
        if (!Number.isFinite(value)) return;
        const width = Math.min(54, (cell * 0.65) / series.length);
        const x =
          f.left +
          cell * (i + 0.5) +
          (j - (series.length - 1) / 2) * width -
          width / 2;
        const rect = el("rect", {
          x,
          y: f.y(value),
          width: Math.max(2, width - 2),
          height: Math.max(0, f.bottom - f.y(value)),
          fill: s.color || red,
        });
        rect.append(el("title", {}, `${text} · ${s.name} ${fmt(value)}명`));
        svg.append(rect);
        if (opts.values)
          label(svg, x + width / 2, f.y(value) - 10, fmt(value), {
            "text-anchor": "middle",
            "font-size": 13,
            fill: ink,
          });
      });
    });
    svg.setAttribute(
      "aria-label",
      opts.summary || svg.getAttribute("aria-label"),
    );
  }
  function lines(svg, labels, series, opts = {}) {
    const maximum = Math.max(
      1,
      ...series.flatMap((s) => s.values.filter(Number.isFinite)),
    );
    const max = Math.ceil(maximum / 1000) * 1000;
    const f = frame(svg, max);
    const x = (i) =>
      f.left +
      15 +
      (i * (f.right - f.left - 30)) / Math.max(1, labels.length - 1);
    const skip =
      labels.length > 10 || (f.w < 450 && labels.length > 5)
        ? Math.ceil(labels.length / (f.w < 450 ? 4 : 7))
        : 1;
    labels.forEach((text, i) => {
      if (i % skip === 0 || i === labels.length - 1)
        label(svg, x(i), f.bottom + 25, text, {
          "text-anchor": "middle",
          "font-size": 12,
        });
    });
    series.forEach((s) => {
      let started = false;
      const d = s.values
        .map((v, i) => {
          if (!Number.isFinite(v)) {
            started = false;
            return "";
          }
          const part = `${started ? "L" : "M"}${x(i)},${f.y(v)}`;
          started = true;
          return part;
        })
        .join(" ");
      const path = el("path", {
        d,
        fill: "none",
        stroke: s.color || red,
        "stroke-width": 2,
        "stroke-linejoin": "round",
      });
      path.append(el("title", {}, s.name));
      if (s.dashed) path.setAttribute("stroke-dasharray", "5 5");
      svg.append(path);
      if (opts.legend)
        label(svg, f.left + series.indexOf(s) * 145, 13, s.name, {
          fill: s.color,
          "font-size": 14,
        });
      s.values.forEach((v, i) => {
        if (!Number.isFinite(v)) return;
        const color = opts.colors ? opts.colors[i] : s.color || red;
        const c = el("circle", {
          cx: x(i),
          cy: f.y(v),
          r: opts.onSelect ? 5 : 3.5,
          fill: color,
          stroke: "#f5f4ef",
          "stroke-width": 1.5,
          class: "chart-mark",
        });
        c.append(el("title", {}, `${labels[i]} · ${s.name} ${fmt(v)}명`));
        if (opts.onSelect) {
          c.setAttribute("role", "button");
          c.setAttribute("tabindex", "0");
          c.setAttribute("aria-label", `${labels[i]} 관중 ${fmt(v)}명`);
          c.addEventListener("click", () => opts.onSelect(i));
          c.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              opts.onSelect(i);
            }
          });
        }
        svg.append(c);
      });
    });
  }
  function shortSeason(s) {
    return s.slice(2, 4) + "–" + s.slice(-2);
  }
  let statusTimer;
  function status(text) {
    $("#chart-status").textContent = text;
    $("#chart-status").classList.add("is-visible");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(
      () => $("#chart-status").classList.remove("is-visible"),
      3000,
    );
  }
  let ticking = false;
  function scrollPaint() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    $(".progress i").style.transform =
      `scaleX(${Math.max(0, Math.min(1, scrollY / Math.max(1, max)))})`;
    let current = "";
    $$("header nav a").forEach((a) => {
      const s = $(a.getAttribute("href"));
      if (s.getBoundingClientRect().top < innerHeight * 0.4)
        current = a.getAttribute("href");
    });
    $$("header nav a").forEach((a) =>
      a.classList.toggle("is-current", a.getAttribute("href") === current),
    );
  }
  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(scrollPaint);
      }
    },
    { passive: true },
  );
  addEventListener("resize", scrollPaint, { passive: true });
  scrollPaint();
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.08 },
  );
  $$(".section-head, .finding, .high-games, .method-grid").forEach((n) => {
    n.classList.add("reveal");
    observer.observe(n);
  });
  const seats = $("#court-seats");
  for (let i = 0; i < 36; i++) {
    const x = 80 + (i % 18) * 25,
      y = i < 18 ? 14 : 377;
    seats.append(
      el("rect", {
        x,
        y,
        width: 14,
        height: 7,
        rx: 1,
        fill: i % 7 === 0 ? "#c92e43" : "#afb7a4",
      }),
    );
  }
  async function load() {
    const [crowd, benchmark, trends] = await Promise.all(
      ["lg_crowd_clean.json", "kbl_benchmark.json", "season_trends.json"].map(
        async (path) => {
          const r = await fetch(path);
          if (!r.ok) throw Error(path);
          return r.json();
        },
      ),
    );
    const seasons = Object.keys(crowd.season_avg)
      .filter((s) => s <= "2024-2025")
      .sort();
    const all = crowd.game_by_game
      .filter((g) => g.날짜 < "2025-05-01")
      .sort((a, b) => a.날짜.localeCompare(b.날짜));
    let season = "2024-2025",
      filter = "all",
      page = 0;
    const PAGE = 10;
    function seasonRows(value) {
      const start = Number(value.slice(0, 4));
      return all.filter(
        (g) => g.날짜 >= `${start}-09-01` && g.날짜 < `${start + 1}-06-01`,
      );
    }
    const latest = seasonRows(season);
    $("#heroSeasonAvg").textContent = fmt(mean(latest));
    $("#heroWeekendAvg").innerHTML =
      fmt(mean(latest.filter((g) => g.is_weekend))) + "<small>명</small>";
    $("#heroWeekdayAvg").innerHTML =
      fmt(mean(latest.filter((g) => !g.is_weekend))) + "<small>명</small>";
    seasons.forEach((s) => {
      const o = document.createElement("option");
      o.value = s;
      o.textContent = shortSeason(s);
      o.selected = s === season;
      $("#season-select").append(o);
    });
    function renderGames() {
      const seasonGames = seasonRows(season);
      const rows = seasonGames.filter(
        (g) => filter === "all" || g.is_weekend === (filter === "weekend"),
      );
      const pages = Math.max(1, Math.ceil(rows.length / PAGE));
      page = Math.max(0, Math.min(page, pages - 1));
      const displayed = rows.slice(page * PAGE, (page + 1) * PAGE);
      $("#crowdMeta").textContent =
        `${shortSeason(season)} · ${rows.length}경기 · 평균 ${fmt(mean(rows))}명`;
      $("#page-info").textContent = `${page + 1} / ${pages}`;
      $("#prevCrowdBtn").disabled = page === 0;
      $("#nextCrowdBtn").disabled = page >= pages - 1;
      $$("[data-filter]").forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.filter === filter),
      );
      lines(
        $("#crowdChart"),
        displayed.map((g) => g.날짜.slice(5).replace("-", "/")),
        [
          {
            name: "관중",
            values: displayed.map((g) => g.관중수),
            color: "#bfc5b5",
          },
        ],
        {
          colors: displayed.map((g) => (g.is_weekend ? red : sage)),
          onSelect: (i) => {
            const g = displayed[i];
            $("#crowd-detail").textContent =
              `${g.날짜} · ${g.is_weekend ? "주말" : "주중"} · 관중 ${fmt(g.관중수)}명`;
          },
        },
      );
      $("#crowdChart").setAttribute(
        "aria-label",
        `${shortSeason(season)} 경기별 관중, ${rows.length}경기 평균 ${fmt(mean(rows))}명. 현재 ${page + 1}/${pages}페이지.`,
      );
      $("#game-table").replaceChildren();
      rows.forEach((g) => {
        const tr = document.createElement("tr");
        [g.날짜, g.is_weekend ? "주말" : "주중", fmt(g.관중수) + "명"].forEach(
          (v) => {
            const td = document.createElement("td");
            td.textContent = v;
            tr.append(td);
          },
        );
        $("#game-table").append(tr);
      });
    }
    $("#season-select").addEventListener("change", (e) => {
      season = e.target.value;
      page = Math.max(
        0,
        Math.ceil(
          seasonRows(season).filter(
            (g) => filter === "all" || g.is_weekend === (filter === "weekend"),
          ).length / PAGE,
        ) - 1,
      );
      $("#crowd-detail").textContent =
        "점을 선택하면 경기 자료를 확인할 수 있습니다.";
      renderGames();
    });
    $$("[data-filter]").forEach((b) =>
      b.addEventListener("click", () => {
        filter = b.dataset.filter;
        page = 0;
        renderGames();
      }),
    );
    $("#prevCrowdBtn").addEventListener("click", () => {
      page--;
      renderGames();
    });
    $("#nextCrowdBtn").addEventListener("click", () => {
      page++;
      renderGames();
    });
    page = Math.ceil(latest.length / PAGE) - 1;
    renderGames();
    addEventListener("resize", renderGames, { passive: true });
    $("#table-toggle").addEventListener("click", () => {
      const opening = $("#game-table-wrap").hidden;
      $("#game-table-wrap").hidden = !opening;
      $("#table-toggle").setAttribute("aria-expanded", String(opening));
      $("#table-toggle").textContent = opening
        ? "경기 데이터 접기 −"
        : "경기 데이터 펼치기 +";
    });
    bars($("#seasonAvgCrowdChart"), seasons.map(shortSeason), [
      {
        name: "평균 관중",
        values: seasons.map((s) => crowd.season_avg[s]),
        color: red,
      },
    ]);
    bars($("#weekendWeekdayChart"), seasons.map(shortSeason), [
      {
        name: "주말",
        values: seasons.map((s) => crowd.season_weekend_avg[s]),
        color: red,
      },
      {
        name: "주중",
        values: seasons.map((s) => crowd.season_weekday_avg[s]),
        color: sage,
      },
    ]);
    lines($("#lgVsLeagueChart"), seasons.map(shortSeason), [
      {
        name: "LG 분석 자료",
        values: seasons.map((s) => crowd.season_avg[s]),
        color: red,
      },
      {
        name: "리그 참고 자료",
        values: seasons.map((s) => benchmark.league_avg_by_season[s] ?? null),
        color: sage,
        dashed: true,
      },
    ]);
    const ranking = benchmark.team_ranking_2024_2025;
    const rankChart = $("#teamRankingChart");
    rankChart.replaceChildren();
    ranking.forEach((t, i) => {
      const y = 25 + i * 38;
      label(rankChart, 115, y + 15, t.team, {
        "text-anchor": "end",
        "font-size": 14,
        fill: t.team === "창원 LG" ? red : ink,
      });
      rankChart.append(
        el("rect", {
          x: 135,
          y,
          width: (t.avg_attendance / 5000) * 410,
          height: 24,
          fill: t.team === "창원 LG" ? red : "#bec5b5",
        }),
      );
      label(
        rankChart,
        145 + (t.avg_attendance / 5000) * 410,
        y + 17,
        fmt(t.avg_attendance),
        { "font-size": 14, fill: ink },
      );
    });
    const targetRows = seasonRows("2024-2025");
    const months = [...new Set(targetRows.map((g) => g.날짜.slice(0, 7)))];
    lines(
      $("#monthlyTrendChart"),
      months.map((m) => Number(m.slice(-2)) + "월"),
      [
        {
          name: "월 평균",
          values: months.map((m) =>
            mean(targetRows.filter((g) => g.날짜.startsWith(m))),
          ),
          color: red,
        },
      ],
    );
    const rounds = Object.entries(trends.round_avg_2024_2025);
    bars(
      $("#roundChart"),
      rounds.map(([r]) => r.replace("라운드", "R")),
      [
        {
          name: "라운드 평균",
          values: rounds.map(([, r]) => r.avg_attendance),
          color: red,
        },
      ],
      { values: true },
    );
    [...targetRows]
      .sort((a, b) => b.관중수 - a.관중수)
      .slice(0, 8)
      .forEach((g) => {
        const card = document.createElement("div");
        card.className = "high-game";
        const s = document.createElement("span");
        s.textContent = g.날짜;
        const b = document.createElement("b");
        b.textContent = fmt(g.관중수);
        const small = document.createElement("small");
        small.textContent = g.is_weekend ? "주말 경기" : "주중 경기";
        card.append(s, b, small);
        $("#specialEventsList").append(card);
      });
  }
  load().catch(() => {
    $("#crowdMeta").textContent =
      "자료를 불러오지 못했습니다. 원자료 링크에서 확인해 주세요.";
    status("차트 자료를 불러오지 못했습니다.");
  });
  const strategies = {
    weekday: [
      "01",
      "WEEKDAY ACTIVATION",
      "평일에도 올 이유가 있다면.",
      "직장인 대상 Night Game Pass와 대학생 대상 관람 프로그램을 대안으로 제안합니다. 할인만으로 채우기보다 방문 시간과 이동 부담을 함께 검토합니다.",
      "주중 평균 관중 2,892명",
      "가격 · 경기 시간 · 접근성 · 운영 인력",
      "추가 관중 · 티켓 수익 · 재방문 의향",
    ],
    round: [
      "02",
      "SEASON MOMENTUM",
      "시즌의 낮은 지점을 먼저.",
      "라운드별 평균 관중이 낮은 구간에 팬 참여 행사를 배치하는 안입니다. 경기 일정과 상대 팀, 공휴일 조건을 함께 확인하고 행사 전후를 비교해야 합니다.",
      "2라운드 평균 관중 2,744명",
      "행사 일정 · 예산 · 상대 팀 · 공휴일",
      "조건이 비슷한 경기의 관중 차이 · 비용",
    ],
    local: [
      "03",
      "LOCAL CONNECTION",
      "경기장 밖에서도, 창원과 연결.",
      "선수와 지역 소상공인을 잇는 Sakers Partners를 제안합니다. 지역 팬의 일상에 구단과 만나는 접점을 만들고 참여 매장의 운영 부담도 함께 검토합니다.",
      "연고 지역 팬의 방문 동기 탐색",
      "협력 매장 · 참여 조건 · 운영 인력",
      "참여 매장 수 · 행사 방문 · 티켓 전환",
    ],
    journey: [
      "04",
      "FAN JOURNEY",
      "첫 방문이, 다음 방문으로.",
      "예매와 방문 경험을 연결해 재방문을 돕는 혜택을 제안합니다. 관중 집계만으로 재방문율을 알 수 없어 추가 자료와 동의 절차가 필요합니다.",
      "현재 자료는 경기별 관중 집계",
      "데이터 확보 · 동의 · 개인정보 관리",
      "재방문율 · 혜택 이용 · 운영 비용",
    ],
  };
  $$("[data-strategy]").forEach((button) =>
    button.addEventListener("click", () => {
      const s = strategies[button.dataset.strategy];
      $$("[data-strategy]").forEach((b) =>
        b.setAttribute("aria-pressed", String(b === button)),
      );
      $("#strategy-content").innerHTML =
        `<span class="strategy-no">${s[0]}</span><p class="kicker">${s[1]}</p><h3>${s[2]}</h3><p>${s[3]}</p><dl><div><dt>출발한 관찰</dt><dd>${s[4]}</dd></div><div><dt>확인할 제약</dt><dd>${s[5]}</dd></div><div><dt>검증할 지표</dt><dd>${s[6]}</dd></div></dl>`;
    }),
  );
  let club = "jeonbuk",
    clubMetric = "total",
    selectedClubRows = [];
  const clubInfo = {
    jeonbuk: ["전북 현대", "FOOTBALL / K LEAGUE", "#3b7560"],
    kb: ["KB 스타즈", "BASKETBALL / WKBL", "#a5781e"],
    ssg: ["SSG 랜더스", "BASEBALL / KBO", red],
  };
  function clubRows() {
    return [...caseStudyData[club]]
      .reverse()
      .map((r) => ({
        season: r.season || r.year,
        total: r.attendance ?? r.total,
        average: r.games ? r.attendance / r.games : (r.avgPerGame ?? null),
        weekdays: r.weekdays,
      }))
      .sort((a, b) => {
        const year = (s) => {
          const n = parseInt(s, 10);
          return n < 100 ? 2000 + n : n;
        };
        return year(a.season) - year(b.season);
      });
  }
  function renderClub(rows) {
    selectedClubRows = rows;
    const [name, sport, color] = clubInfo[club];
    $("#club-name").textContent = name;
    $("#club-sport").textContent = sport;
    $$("[data-club-metric]").forEach((b) => {
      b.disabled =
        (b.dataset.clubMetric === "average" && club === "kb") ||
        (b.dataset.clubMetric === "weekday" && club !== "ssg");
      b.setAttribute(
        "aria-pressed",
        String(b.dataset.clubMetric === clubMetric),
      );
    });
    if (clubMetric === "weekday") {
      const available = rows.filter((r) => r.weekdays?.tue !== null);
      if (available.length) {
        lines(
          $("#club-chart"),
          ["화", "수", "목", "금", "토", "일"],
          available.map((r, i) => ({
            name: r.season,
            values: ["tue", "wed", "thu", "fri", "sat", "sun"].map(
              (day) => r.weekdays[day],
            ),
            color: ["#ad927e", "#718177", "#753847", red][i % 4],
          })),
          { legend: true },
        );
        $("#club-chart").setAttribute(
          "aria-label",
          available.map((r) => r.season).join(", ") +
            " SSG 랜더스 요일별 평균 관중.",
        );
      } else {
        $("#club-chart").replaceChildren();
        label(
          $("#club-chart"),
          450,
          150,
          "선택한 기간에 요일별 자료가 없습니다.",
          { "text-anchor": "middle", "font-size": 20 },
        );
      }
    } else {
      const average = clubMetric === "average";
      bars(
        $("#club-chart"),
        rows.map((r) => r.season),
        [
          {
            name: average ? "경기당 평균" : "총 관중",
            values: rows.map((r) => (average ? r.average : r.total)),
            color,
          },
        ],
        {
          summary: `${name} ${rows[0].season}부터 ${rows.at(-1).season}까지 ${average ? "경기당 평균" : "총 관중"} 비교`,
        },
      );
    }
    $("#club-range-note").textContent =
      `${rows[0].season} → ${rows.at(-1).season} · ${rows.length}개 시즌 · 총 ${fmt(rows.reduce((s, r) => s + r.total, 0))}명`;
    $("#club-table").replaceChildren();
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      [
        r.season,
        fmt(r.total) + "명",
        r.average === null ? "자료 없음" : fmt(r.average) + "명",
      ].forEach((v) => {
        const td = document.createElement("td");
        td.textContent = v;
        tr.append(td);
      });
      $("#club-table").append(tr);
    });
  }
  function selectClub(next) {
    club = next;
    clubMetric = "total";
    const rows = clubRows();
    $$("[data-club]").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.club === club),
    );
    ["#club-start", "#club-end"].forEach((id, k) => {
      const select = $(id);
      select.replaceChildren();
      rows.forEach((r, i) => {
        const o = document.createElement("option");
        o.value = i;
        o.textContent = r.season;
        o.selected = k === 0 ? i === 0 : i === rows.length - 1;
        select.append(o);
      });
    });
    renderClub(rows);
  }
  $$("[data-club]").forEach((b) =>
    b.addEventListener("click", () => selectClub(b.dataset.club)),
  );
  $("#club-apply").addEventListener("click", () => {
    const a = Number($("#club-start").value),
      b = Number($("#club-end").value);
    if (a > b) {
      $("#club-range-note").textContent =
        "시작 시즌이 종료 시즌보다 늦습니다. 기간을 다시 선택해 주세요.";
      $("#club-start").focus();
      return;
    }
    renderClub(clubRows().slice(a, b + 1));
  });
  $$("[data-club-metric]").forEach((b) =>
    b.addEventListener("click", () => {
      clubMetric = b.dataset.clubMetric;
      renderClub(selectedClubRows);
    }),
  );
  selectClub("jeonbuk");
})();
