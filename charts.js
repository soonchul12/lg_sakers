// 공통 옵션
const commonOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: "#E5E7EB",
        font: { size: 10 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: "#E5E7EB", font: { size: 10 } },
      grid: { color: "rgba(148, 163, 184, 0.2)" }
    },
    y: {
      ticks: { color: "#E5E7EB", font: { size: 10 } },
      grid: { color: "rgba(148, 163, 184, 0.2)" }
    }
  }
};

// --- LG Sakers 데이터 로직 (24-25까지만 필터링) ---
fetch("lg_crowd_clean.json")
  .then(res => res.json())
  .then(data => {
    const targetSeason = "2024-2025";
    const seasonAvgEl = document.getElementById("heroSeasonAvg");
    const weekendAvgEl = document.getElementById("heroWeekendAvg");
    const weekdayAvgEl = document.getElementById("heroWeekdayAvg");
    
    if (seasonAvgEl && data.season_avg[targetSeason]) seasonAvgEl.textContent = data.season_avg[targetSeason].toLocaleString();
    if (weekendAvgEl && data.season_weekend_avg[targetSeason]) weekendAvgEl.textContent = data.season_weekend_avg[targetSeason].toLocaleString();
    if (weekdayAvgEl && data.season_weekday_avg[targetSeason]) weekdayAvgEl.textContent = data.season_weekday_avg[targetSeason].toLocaleString();

    // 1. 시즌별 평균 관중수
    const seasonAvgCtx = document.getElementById("seasonAvgCrowdChart");
    if (seasonAvgCtx) {
      const seasons = Object.keys(data.season_avg).sort().filter(s => s <= targetSeason);
      new Chart(seasonAvgCtx, {
        type: "bar",
        data: {
          labels: seasons,
          datasets: [{ label: "시즌별 평균 관중수", data: seasons.map(s => data.season_avg[s]), backgroundColor: "#FFC72C" }]
        },
        options: commonOptions
      });
    }

    // 2. 시즌별 주말 vs 주중 평균
    const weekendWeekdayCtx = document.getElementById("weekendWeekdayChart");
    if (weekendWeekdayCtx) {
      const seasons = Object.keys(data.season_weekend_avg).sort().filter(s => s <= targetSeason);
      new Chart(weekendWeekdayCtx, {
        type: "bar",
        data: {
          labels: seasons,
          datasets: [
            { label: "주말 평균 (토·일)", data: seasons.map(s => data.season_weekend_avg[s]), backgroundColor: "#FFC72C" },
            { label: "주중 평균 (월~금)", data: seasons.map(s => data.season_weekday_avg[s]), backgroundColor: "rgba(148, 163, 184, 0.6)" }
          ]
        },
        options: commonOptions
      });
    }

    // 3. 경기별 관중수 (페이지네이션 포함)
    const allCrowdData = data.game_by_game.filter(g => g.날짜 < "2025-05-01");
    allCrowdData.sort((a, b) => new Date(b.날짜) - new Date(a.날짜));
    
    let currentCrowdIndex = 0;
    const CROWD_PER_PAGE = 10;
    const crowdCtx = document.getElementById("crowdChart");
    const prevBtn = document.getElementById("prevCrowdBtn");
    const nextBtn = document.getElementById("nextCrowdBtn");
    let crowdChartInstance = null;

    function updateCrowdChart() {
      if (!crowdCtx || allCrowdData.length === 0) return;
      const startIndex = currentCrowdIndex;
      const endIndex = Math.min(startIndex + CROWD_PER_PAGE, allCrowdData.length);
      const currentData = allCrowdData.slice(startIndex, endIndex);
      const sortedData = [...currentData].sort((a, b) => new Date(a.날짜) - new Date(b.날짜));
      
      const labels = sortedData.map(r => r.날짜);
      const values = sortedData.map(r => r.관중수);
      const pointColors = sortedData.map(r => r.is_weekend ? "#FFC72C" : "#94A3B8");

      if (prevBtn) prevBtn.disabled = currentCrowdIndex + CROWD_PER_PAGE >= allCrowdData.length;
      if (nextBtn) nextBtn.disabled = currentCrowdIndex === 0;

      if (crowdChartInstance) {
        crowdChartInstance.data.labels = labels;
        crowdChartInstance.data.datasets[0].data = values;
        crowdChartInstance.data.datasets[0].pointBackgroundColor = pointColors;
        crowdChartInstance.update();
      } else {
        crowdChartInstance = new Chart(crowdCtx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "홈 관중수",
              data: values,
              borderColor: "#FFC72C",
              backgroundColor: "rgba(255, 199, 44, 0.2)",
              tension: 0.3,
              pointRadius: 6,
              pointBackgroundColor: pointColors
            }]
          },
          options: commonOptions
        });
      }
    }

    if (crowdCtx) updateCrowdChart();
    if (prevBtn) prevBtn.addEventListener("click", () => { currentCrowdIndex += CROWD_PER_PAGE; updateCrowdChart(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { currentCrowdIndex -= CROWD_PER_PAGE; updateCrowdChart(); });
  });

// --- 벤치마킹 분석 ---
fetch("kbl_benchmark.json")
  .then(res => res.json())
  .then(benchmarkData => {
    fetch("lg_crowd_clean.json").then(res => res.json()).then(lgData => {
      const lgVsLeagueCtx = document.getElementById("lgVsLeagueChart");
      if (lgVsLeagueCtx) {
        const seasons = Object.keys(lgData.season_avg).sort().filter(s => s <= "2024-2025");
        new Chart(lgVsLeagueCtx, {
          type: "line",
          data: {
            labels: seasons,
            datasets: [
              { label: "LG 세이커스", data: seasons.map(s => lgData.season_avg[s]), borderColor: "#FFC72C", tension: 0.3 },
              { label: "KBL 리그 평균", data: seasons.map(s => benchmarkData.league_avg_by_season[s] || 0), borderColor: "#94A3B8", borderDash: [5, 5], tension: 0.3 }
            ]
          },
          options: commonOptions
        });
      }

      const teamRankingCtx = document.getElementById("teamRankingChart");
      if (teamRankingCtx) {
        const teams = benchmarkData.team_ranking_2024_2025;
        if (teams) {
          const teamLabels = teams.map(t => t.team);
          const attendances = teams.map(t => t.avg_attendance);
          new Chart(teamRankingCtx, {
            type: "bar",
            data: {
              labels: teamLabels,
              datasets: [{ label: "평균 관중수", data: attendances, backgroundColor: teamLabels.map(t => t === "창원 LG" ? "#FFC72C" : "#94A3B8") }]
            },
            options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }
          });
        }
      }
    });
  });

// --- 시즌별 트렌드 (24-25만) ---
fetch("season_trends.json")
  .then(res => res.json())
  .then(trendData => {
    // 1. 라운드별 관중수 패턴
    const roundCtx = document.getElementById("roundChart");
    if (roundCtx && trendData.round_avg_2024_2025) {
      const rounds = Object.keys(trendData.round_avg_2024_2025).sort((a, b) => parseInt(a.replace('라운드','')) - parseInt(b.replace('라운드','')));
      const seasonAvg = trendData.season_trends["2024-2025"].total_avg;
      new Chart(roundCtx, {
        type: "bar",
        data: {
          labels: rounds.map(r => r.replace('라운드', 'R')),
          datasets: [{ label: "2024-2025 시즌", data: rounds.map(r => trendData.round_avg_2024_2025[r].avg_attendance), backgroundColor: "rgba(255, 199, 44, 0.6)" }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => `관중수: ${context.parsed.y.toLocaleString()}명`,
                afterLabel: (context) => `평균 대비: ${context.parsed.y - seasonAvg > 0 ? '+' : ''}${(context.parsed.y - seasonAvg).toLocaleString()}명`
              }
            }
          }
        }
      });
    }

    // 2. 월별 관중수 트렌드
    const monthlyTrendCtx = document.getElementById("monthlyTrendChart");
    if (monthlyTrendCtx && trendData.monthly_avg_2024_2025) {
      const months = Object.keys(trendData.monthly_avg_2024_2025).sort();
      new Chart(monthlyTrendCtx, {
        type: "line",
        data: {
          labels: months.map(m => m.split('-')[1] + '월'),
          datasets: [{ label: "월별 평균 관중수", data: months.map(m => trendData.monthly_avg_2024_2025[m]), borderColor: "#FFC72C", fill: true, backgroundColor: "rgba(255, 199, 44, 0.1)", tension: 0.3 }]
        },
        options: commonOptions
      });
    }

    // 3. 특별 이벤트 목록
    const specialEventsList = document.getElementById("specialEventsList");
    if (specialEventsList && trendData.special_events_2024_2025) {
      const seasonAvg = trendData.season_trends["2024-2025"].total_avg;
      specialEventsList.innerHTML = "";
      trendData.special_events_2024_2025.forEach(event => {
        const date = new Date(event.date);
        const diffPercent = (((event.attendance - seasonAvg) / seasonAvg) * 100).toFixed(1);
        const eventDiv = document.createElement("div");
        eventDiv.className = "flex items-center justify-between p-2 bg-white/5 rounded-lg";
        eventDiv.innerHTML = `<div><span class="text-yellow-300 font-semibold">${date.getMonth()+1}/${date.getDate()}</span></div><div class="text-right"><div class="text-white font-semibold">${event.attendance.toLocaleString()}명</div><div class="text-emerald-400 text-[10px]">+${diffPercent}%</div></div>`;
        specialEventsList.appendChild(eventDiv);
      });
    }
  });

// --- 케이스스터디 데이터 ---
const jeonbukData = [
  { season: "24시즌", attendance: 295642, games: 19 }, { season: "23시즌", attendance: 238759, games: 19 },
  { season: "22시즌", attendance: 114328, games: 19 }, { season: "21시즌", attendance: 82471, games: 19 },
  { season: "20시즌", attendance: 16808, games: 14 }, { season: "19시즌", attendance: 278738, games: 20 },
  { season: "18시즌", attendance: 226224, games: 19 }, { season: "17시즌", attendance: 221579, games: 19 },
  { season: "16시즌", attendance: 318921, games: 19 }, { season: "15시즌", attendance: 330856, games: 19 },
  { season: "14시즌", attendance: 249954, games: 19 }, { season: "13시즌", attendance: 193060, games: 19 }
];

const kbStarsData = [
  { season: "2011-2012", attendance: 43086 }, { season: "12-13", attendance: 29616 },
  { season: "13-14", attendance: 39372 }, { season: "14-15", attendance: 39234 },
  { season: "15-16", attendance: 36914 }, { season: "16-17", attendance: 27578 },
  { season: "17-18", attendance: 30598 }, { season: "18-19", attendance: 37534 },
  { season: "19-20", attendance: 22612 }, { season: "20-21", attendance: 2282 },
  { season: "21-22", attendance: 15396 }, { season: "22-23", attendance: 21006 },
  { season: "23-24", attendance: 36118 }, { season: "24-25", attendance: 32895 }
];

const ssgData = [
  { year: "2021년", total: 105534, avgPerGame: 2574, weekdays: { tue: null, wed: null, thu: null, fri: null, sat: null, sun: null } },
  { year: "2022년", total: 981546, avgPerGame: 13633, weekdays: { tue: 7654, wed: 8120, thu: 8410, fri: 13850, sat: 19850, sun: 17200 } },
  { year: "2023년", total: 1068211, avgPerGame: 14836, weekdays: { tue: 9215, wed: 9840, thu: 11353, fri: 14920, sat: 21500, sun: 18950 } },
  { year: "2024년", total: 1143773, avgPerGame: 15886, weekdays: { tue: 10872, wed: 11250, thu: 13311, fri: 16550, sat: 22100, sun: 20450 } },
  { year: "2025년", total: 1281093, avgPerGame: 17793, weekdays: { tue: 12940, wed: 13210, thu: 14470, fri: 18920, sat: 22950, sun: 22600 } }
];

function initCaseStudy() {
  // 전북현대
  const jbCtx = document.getElementById("jeonbukChart");
  if (jbCtx) new Chart(jbCtx, { type: "bar", data: { labels: jeonbukData.map(d => d.season), datasets: [{ label: "총 관중수", data: jeonbukData.map(d => d.attendance), backgroundColor: "#00A651" }] }, options: commonOptions });
  const jbTable = document.getElementById("jeonbukTableBody");
  if (jbTable) { jbTable.innerHTML = ""; jeonbukData.forEach(d => { jbTable.innerHTML += `<tr><td class="py-2 px-4">${d.season}</td><td class="text-right py-2 px-4">${d.attendance.toLocaleString()}명</td><td class="text-right py-2 px-4">${Math.round(d.attendance/d.games).toLocaleString()}명</td></tr>`; }); }

  // KB스타즈
  const kbCtx = document.getElementById("kbStarsChart");
  if (kbCtx) new Chart(kbCtx, { type: "bar", data: { labels: kbStarsData.map(d => d.season), datasets: [{ label: "관중수", data: kbStarsData.map(d => d.attendance), backgroundColor: "#FFC72C" }] }, options: commonOptions });
  const kbTable = document.getElementById("kbStarsTableBody");
  if (kbTable) { kbTable.innerHTML = ""; kbStarsData.forEach(d => { kbTable.innerHTML += `<tr><td class="py-2 px-4">${d.season}</td><td class="text-right py-2 px-4">${d.attendance.toLocaleString()}명</td></tr>`; }); }

  // SSG 랜더스
  const ssgTotalCtx = document.getElementById("ssgTotalChart");
  if (ssgTotalCtx) new Chart(ssgTotalCtx, { type: "bar", data: { labels: ssgData.map(d => d.year), datasets: [{ label: "총 관중수", data: ssgData.map(d => d.total), backgroundColor: "#C8102E" }] }, options: commonOptions });
  
  const ssgAvgCtx = document.getElementById("ssgAvgChart");
  if (ssgAvgCtx) new Chart(ssgAvgCtx, { type: "line", data: { labels: ssgData.map(d => d.year), datasets: [{ label: "경기당 평균 관중수", data: ssgData.map(d => d.avgPerGame), borderColor: "#C8102E", fill: true, backgroundColor: "rgba(200,16,46,0.1)", tension: 0.3 }] }, options: commonOptions });

  const ssgWeekdayCtx = document.getElementById("ssgWeekdayChart");
  if (ssgWeekdayCtx) {
    const yearsWithData = ssgData.filter(d => d.weekdays.tue !== null);
    new Chart(ssgWeekdayCtx, {
      type: "bar",
      data: {
        labels: ["평일(화~목)", "주말(금~일)"],
        datasets: yearsWithData.map((d, i) => ({
          label: d.year,
          data: [Math.round((d.weekdays.tue + d.weekdays.wed + d.weekdays.thu)/3), Math.round((d.weekdays.fri + d.weekdays.sat + d.weekdays.sun)/3)],
          backgroundColor: `rgba(200,16,46,${0.2 + (i*0.2)})`,
          borderColor: "#C8102E",
          borderWidth: 1
        }))
      },
      options: commonOptions
    });
  }

  const ssgTable = document.getElementById("ssgTableBody");
  if (ssgTable) {
    ssgTable.innerHTML = "";
    ssgData.forEach(d => {
      ssgTable.innerHTML += `<tr>
        <td class="py-2 px-4">${d.year}</td>
        <td class="text-right py-2 px-4">${d.total.toLocaleString()}명</td>
        <td class="text-right py-2 px-4">${d.avgPerGame.toLocaleString()}명</td>
        <td class="text-right py-2 px-4">${d.weekdays.tue ? d.weekdays.tue.toLocaleString() : '-'}</td>
        <td class="text-right py-2 px-4">${d.weekdays.wed ? d.weekdays.wed.toLocaleString() : '-'}</td>
        <td class="text-right py-2 px-4">${d.weekdays.thu ? d.weekdays.thu.toLocaleString() : '-'}</td>
        <td class="text-right py-2 px-4">${d.weekdays.fri ? d.weekdays.fri.toLocaleString() : '-'}</td>
        <td class="text-right py-2 px-4">${d.weekdays.sat ? d.weekdays.sat.toLocaleString() : '-'}</td>
        <td class="text-right py-2 px-4">${d.weekdays.sun ? d.weekdays.sun.toLocaleString() : '-'}</td>
      </tr>`;
    });
  }
}

initCaseStudy();

// --- 화면 전환 ---
const mainContainer = document.getElementById("mainContainer");
const caseStudyContainer = document.getElementById("caseStudyContainer");
const caseStudyLink = document.querySelector('a[href="#casestudy"]');
const backToMainBtn = document.getElementById("backToMainBtn");

if (caseStudyLink) caseStudyLink.addEventListener("click", (e) => { e.preventDefault(); mainContainer.classList.add("hidden"); caseStudyContainer.classList.remove("hidden"); window.scrollTo(0, 0); });
if (backToMainBtn) backToMainBtn.addEventListener("click", () => { mainContainer.classList.remove("hidden"); caseStudyContainer.classList.add("hidden"); window.scrollTo(0, 0); });
