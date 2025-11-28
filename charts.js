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

// Hero 미니 승률 차트 (샘플)
const heroCtx = document.getElementById("heroWinRateChart");
if (heroCtx) {
  new Chart(heroCtx, {
    type: "line",
    data: {
      labels: ["2019-20", "20-21", "21-22", "22-23", "23-24", "24-25"],
      datasets: [{
        label: "승률(샘플)",
        data: [0.38, 0.45, 0.44, 0.67, 0.67, 0.63],
        borderColor: "#FFC72C",
        tension: 0.3
      }]
    },
    options: {
      ...commonOptions,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

// 시즌 승률 차트 (샘플)
const seasonCtx = document.getElementById("seasonWinRateChart");
if (seasonCtx) {
  new Chart(seasonCtx, {
    type: "bar",
    data: {
      labels: ["20-21", "21-22", "22-23", "23-24", "24-25"],
      datasets: [{
        label: "승률(샘플)",
        data: [0.35, 0.44, 0.67, 0.67, 0.63],
        backgroundColor: "rgba(248, 250, 252, 0.7)"
      }]
    },
    options: commonOptions
  });
}

// 홈 경기 득점/실점 차트 (샘플)
const homeCtx = document.getElementById("homePtsChart");
if (homeCtx) {
  new Chart(homeCtx, {
    type: "line",
    data: {
      labels: ["1R", "2R", "3R", "4R", "5R"],
      datasets: [
        {
          label: "득점",
          data: [80, 84, 83, 81, 83],
          borderColor: "#FFC72C",
          tension: 0.3
        },
        {
          label: "실점",
          data: [78, 77, 76, 75, 77],
          borderColor: "#f97373",
          tension: 0.3
        }
      ]
    },
    options: commonOptions
  });
}

// SNS 타입별 참여율 (샘플)
const snsCtx = document.getElementById("snsTypeChart");
if (snsCtx) {
  new Chart(snsCtx, {
    type: "radar",
    data: {
      labels: ["하이라이트", "사진", "카드뉴스", "밈 콘텐츠", "이벤트 공지"],
      datasets: [{
        label: "참여율(샘플, 상대값)",
        data: [90, 70, 55, 95, 65],
        borderColor: "#FFC72C",
        backgroundColor: "rgba(250, 204, 21, 0.2)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#E5E7EB", font: { size: 10 } }
        }
      },
      scales: {
        r: {
          angleLines: { color: "rgba(148, 163, 184, 0.4)" },
          grid: { color: "rgba(148, 163, 184, 0.3)" },
          pointLabels: { color: "#E5E7EB", font: { size: 10 } },
          ticks: { display: false }
        }
      }
    }
  });
}

// 굿즈 매출 비중 (샘플)
const goodsCtx = document.getElementById("goodsChart");
if (goodsCtx) {
  new Chart(goodsCtx, {
    type: "doughnut",
    data: {
      labels: ["의류", "머플러/응원도구", "피규어/포토카드", "기타"],
      datasets: [{
        data: [40, 30, 20, 10],
        backgroundColor: [
          "#FFC72C",
          "rgba(248, 250, 252, 0.9)",
          "rgba(148, 163, 184, 0.9)",
          "rgba(30, 64, 175, 0.9)"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#E5E7EB",
            font: { size: 10 }
          }
        }
      }
    }
  });
}

// ✅ 실제 LG 세이커스 정규리그 JSON 데이터를 불러와서 차트 + 요약 카드에 반영
fetch("lg_sakers_standings_2024_25.json")
  .then(res => res.json())
  .then(data => {
    console.log("LG Sakers JSON Loaded:", data);

    const lgCtx = document.getElementById("lgChart");
    if (lgCtx) {
      new Chart(lgCtx, {
        type: "bar",
        data: {
          labels: ["승", "패", "득점", "실점", "득실차"],
          datasets: [{
            label: "2024-25 LG 세이커스 (실제 데이터)",
            data: [
              data.wins,
              data.losses,
              data.points_for,
              data.points_against,
              data.point_diff
            ],
            backgroundColor: [
              "#FFC72C",
              "#f97373",
              "#60a5fa",
              "#a78bfa",
              "#34d399"
            ]
          }]
        },
        options: {
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
        }
      });
    }

    // 요약 카드 채우기
    const winsEl = document.getElementById("winsValue");
    const lossesEl = document.getElementById("lossesValue");
    const winPctEl = document.getElementById("winPctValue");
    const pfEl = document.getElementById("pfValue");
    const paEl = document.getElementById("paValue");
    const diffEl = document.getElementById("diffValue");
    const summaryEl = document.getElementById("summaryText");

    if (winsEl && lossesEl && winPctEl && pfEl && paEl && diffEl && summaryEl) {
      winsEl.textContent = data.wins;
      lossesEl.textContent = data.losses;
      winPctEl.textContent = data.win_pct.toFixed(1);
      pfEl.textContent = data.points_for.toLocaleString();
      paEl.textContent = data.points_against.toLocaleString();
      diffEl.textContent = data.point_diff > 0
        ? `+${data.point_diff}`
        : data.point_diff;

      const msgParts = [];
      msgParts.push(`총 ${data.games}경기 ${data.wins}승 ${data.losses}패, 승률 ${data.win_pct.toFixed(1)}%`);
      if (data.point_diff > 0) {
        msgParts.push(`득점이 실점보다 ${data.point_diff}점 더 많아 공수 밸런스가 좋습니다.`);
      } else if (data.point_diff < 0) {
        msgParts.push(`실점이 득점보다 ${Math.abs(data.point_diff)}점 많아 수비/실책 보완이 필요합니다.`);
      } else {
        msgParts.push(`득점과 실점이 같아 접전 경기가 많았던 시즌입니다.`);
      }

      summaryEl.textContent = msgParts.join(" · ");
    }
  })
  .catch(err => {
    console.error("JSON 로드 실패 (standings):", err);
    const summaryEl = document.getElementById("summaryText");
    if (summaryEl) {
      summaryEl.textContent = "실제 데이터를 불러오는 데 실패했습니다. 서버/파일 경로를 확인해주세요.";
    }
  });

// ✅ 홈/원정 득점·실점 JSON(lg_home_away_points.json) 불러와서 차트로 표시
// JSON 형식 (네가 보낸 그대로):
// {
//   "home_points_for": 82.4,
//   "home_points_against": 76.1,
//   "away_points_for": 79.3,
//   "away_points_against": 81.0
// }
fetch("lg_home_away_points.json")
  .then(res => res.json())
  .then(data => {
    console.log("LG Home/Away JSON Loaded:", data);

    const ctx = document.getElementById("lgHomeAwayChart");
    if (!ctx) return;

    const homeFor = data.home_points_for;
    const homeAgainst = data.home_points_against;
    const awayFor = data.away_points_for;
    const awayAgainst = data.away_points_against;

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["홈 득점", "홈 실점", "원정 득점", "원정 실점"],
        datasets: [
          {
            label: "평균 점수 (2024-25 실제 데이터)",
            data: [homeFor, homeAgainst, awayFor, awayAgainst],
            backgroundColor: [
              "#FFC72C",
              "#f97373",
              "#60a5fa",
              "#a78bfa"
            ]
          }
        ]
      },
      options: {
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
      }
    });
  })
  .catch(err => {
    console.error("JSON 로드 실패 (home/away):", err);
  });

// 관중수 차트 (lg_crowd_clean.json 사용)
let crowdChart = null;
let allCrowdData = [];
let currentCrowdIndex = 0;
const CROWD_PER_PAGE = 10;

fetch("lg_crowd_clean.json")
  .then(res => res.json())
  .then(data => {
    // 년도별 평균 관중수 차트
    const seasonAvgCtx = document.getElementById("seasonAvgCrowdChart");
    if (seasonAvgCtx) {
      const seasons = Object.keys(data.season_avg);
      const avgValues = Object.values(data.season_avg);

      new Chart(seasonAvgCtx, {
        type: "bar",
        data: {
          labels: seasons,
          datasets: [{
            label: "시즌별 평균 관중수",
            data: avgValues,
            backgroundColor: "#FFC72C",
            borderColor: "#FFC72C",
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: "#E5E7EB", font: { size: 10 } }
            }
          },
          scales: {
            x: {
              ticks: { color: "#E5E7EB", font: { size: 9 } },
              grid: { color: "rgba(148, 163, 184, 0.2)" }
            },
            y: {
              ticks: { color: "#E5E7EB", font: { size: 10 } },
              grid: { color: "rgba(148, 163, 184, 0.2)" },
              beginAtZero: true
            }
          }
        }
      });
    }

    // 날짜별 관중수 차트 (10개씩 표시)
    allCrowdData = data.game_by_game;
    // 최신 날짜순으로 정렬 (최근 경기가 먼저)
    allCrowdData.sort((a, b) => new Date(b.날짜) - new Date(a.날짜));
    
    const crowdCtx = document.getElementById("crowdChart");
    const prevBtn = document.getElementById("prevCrowdBtn");
    const nextBtn = document.getElementById("nextCrowdBtn");

    // updateCrowdChart 함수 정의
    function updateCrowdChart() {
      if (!crowdCtx || allCrowdData.length === 0) {
        console.error("차트 컨텍스트 또는 데이터가 없습니다.");
        return;
      }

      const startIndex = currentCrowdIndex;
      const endIndex = Math.min(startIndex + CROWD_PER_PAGE, allCrowdData.length);
      const currentData = allCrowdData.slice(startIndex, endIndex);
      
      // 날짜순으로 정렬 (오래된 것부터)
      const sortedData = [...currentData].sort((a, b) => new Date(a.날짜) - new Date(b.날짜));
      
      const labels = sortedData.map(r => r.날짜);
      const values = sortedData.map(r => r.관중수);

      // 버튼 상태 업데이트
      if (prevBtn) {
        prevBtn.disabled = currentCrowdIndex + CROWD_PER_PAGE >= allCrowdData.length;
      }
      if (nextBtn) {
        nextBtn.disabled = currentCrowdIndex === 0;
      }

      // 차트 업데이트 또는 생성
      if (crowdChart) {
        crowdChart.data.labels = labels;
        crowdChart.data.datasets[0].data = values;
        crowdChart.update();
      } else {
        crowdChart = new Chart(crowdCtx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "LG 세이커스 홈 관중수",
              data: values,
              borderColor: "#FFC72C",
              backgroundColor: "rgba(255, 199, 44, 0.3)",
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                labels: { color: "#E5E7EB", font: { size: 10 } }
              }
            },
            scales: {
              x: {
                ticks: { color: "#E5E7EB", font: { size: 9 } },
                grid: { color: "rgba(255,255,255,0.1)" }
              },
              y: {
                ticks: { color: "#E5E7EB", font: { size: 10 } },
                grid: { color: "rgba(255,255,255,0.1)" },
                beginAtZero: true
              }
            }
          }
        });
      }
    }

    // 초기 차트 생성
    if (crowdCtx) {
      updateCrowdChart();
    }

    // 버튼 이벤트 리스너
    // 이전 버튼: 더 오래된 경기 보기 (인덱스 증가)
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentCrowdIndex + CROWD_PER_PAGE < allCrowdData.length) {
          currentCrowdIndex += CROWD_PER_PAGE;
          updateCrowdChart();
        }
      });
    }

    // 다음 버튼: 더 최근 경기 보기 (인덱스 감소)
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentCrowdIndex >= CROWD_PER_PAGE) {
          currentCrowdIndex -= CROWD_PER_PAGE;
          updateCrowdChart();
        }
      });
    }
  })
  .catch(err => {
    console.error("JSON 로드 실패 (crowd):", err);
  });

