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

// Hero 섹션 관중수 데이터 표시
fetch("lg_crowd_clean.json")
  .then(res => res.json())
  .then(data => {
    const seasonAvgEl = document.getElementById("heroSeasonAvg");
    const weekendAvgEl = document.getElementById("heroWeekendAvg");
    const weekdayAvgEl = document.getElementById("heroWeekdayAvg");
    
    if (seasonAvgEl && data.season_avg["2024-2025"]) {
      seasonAvgEl.textContent = data.season_avg["2024-2025"].toLocaleString();
    }
    if (weekendAvgEl && data.season_weekend_avg["2024-2025"]) {
      weekendAvgEl.textContent = data.season_weekend_avg["2024-2025"].toLocaleString();
    }
    if (weekdayAvgEl && data.season_weekday_avg["2024-2025"]) {
      weekdayAvgEl.textContent = data.season_weekday_avg["2024-2025"].toLocaleString();
    }
  })
  .catch(err => {
    console.error("JSON 로드 실패 (hero):", err);
  });

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
      
      // 주중/주말에 따라 포인트 색상 구분
      // 주말(토·일): 밝은 노란색, 주중(월~금): 회색 계열로 명확히 구분
      const pointBackgroundColors = sortedData.map(r => 
        r.is_weekend ? "#FFC72C" : "#94A3B8"  // 주말: 노란색, 주중: 회색
      );
      const pointBorderColors = sortedData.map(r => 
        r.is_weekend ? "#FFC72C" : "#64748B"  // 주말: 노란색, 주중: 진한 회색
      );

      // 버튼 상태 업데이트
      if (prevBtn) {
        prevBtn.disabled = currentCrowdIndex + CROWD_PER_PAGE >= allCrowdData.length;
      }
      if (nextBtn) {
        nextBtn.disabled = currentCrowdIndex === 0;
      }

      // 차트 옵션에 sortedData를 저장하여 tooltip에서 사용할 수 있도록 함
      const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#E5E7EB", font: { size: 10 } },
            display: true
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                const dataIndex = context[0].dataIndex;
                // sortedData는 현재 페이지의 데이터이므로 인덱스가 올바르게 매핑됨
                if (dataIndex >= 0 && dataIndex < sortedData.length) {
                  const gameData = sortedData[dataIndex];
                  const date = gameData.날짜;
                  const opponent = gameData.상대팀 || gameData.상대 || gameData.VS || gameData.vs;
                  if (opponent) {
                    return `${date} vs ${opponent}`;
                  }
                  return date;
                }
                return "";
              },
              afterLabel: function(context) {
                const dataIndex = context.dataIndex;
                // sortedData는 현재 페이지의 데이터이므로 인덱스가 올바르게 매핑됨
                if (dataIndex >= 0 && dataIndex < sortedData.length) {
                  const gameData = sortedData[dataIndex];
                  const isWeekend = gameData.is_weekend;
                  const opponent = gameData.상대팀 || gameData.상대 || gameData.VS || gameData.vs;
                  let result = isWeekend ? "주말 (토·일)" : "주중 (월~금)";
                  if (opponent) {
                    result += `\n상대팀: ${opponent}`;
                  }
                  return result;
                }
                return "";
              }
            }
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
      };

      // 차트 업데이트 또는 생성
      // sortedData를 차트 객체에 저장하여 tooltip에서 항상 최신 데이터를 참조하도록 함
      if (crowdChart) {
        // 기존 차트 업데이트 시 sortedData를 차트 객체에 저장
        crowdChart.currentSortedData = sortedData; // 현재 페이지의 정렬된 데이터 저장
        crowdChart.data.labels = labels;
        crowdChart.data.datasets[0].data = values;
        crowdChart.data.datasets[0].pointBackgroundColor = pointBackgroundColors;
        crowdChart.data.datasets[0].pointBorderColor = pointBorderColors;
        // tooltip callback에서 저장된 sortedData를 사용
        crowdChart.options.plugins.tooltip.callbacks.title = function(context) {
          const dataIndex = context[0].dataIndex;
          const currentData = this.chart.currentSortedData || sortedData;
          if (dataIndex >= 0 && dataIndex < currentData.length) {
            const gameData = currentData[dataIndex];
            const date = gameData.날짜;
            const opponent = gameData.상대팀 || gameData.상대 || gameData.VS || gameData.vs;
            if (opponent) {
              return `${date} vs ${opponent}`;
            }
            return date;
          }
          return "";
        };
        crowdChart.options.plugins.tooltip.callbacks.afterLabel = function(context) {
          const dataIndex = context.dataIndex;
          const currentData = this.chart.currentSortedData || sortedData;
          if (dataIndex >= 0 && dataIndex < currentData.length) {
            const gameData = currentData[dataIndex];
            const isWeekend = gameData.is_weekend;
            const opponent = gameData.상대팀 || gameData.상대 || gameData.VS || gameData.vs;
            let result = isWeekend ? "주말 (토·일)" : "주중 (월~금)";
            if (opponent) {
              result += `\n상대팀: ${opponent}`;
            }
            return result;
          }
          return "";
        };
        crowdChart.update();
      } else {
        // 새 차트 생성 시 sortedData를 차트 객체에 저장
        const chartData = {
          labels: labels,
          datasets: [{
            label: "LG 세이커스 홈 관중수",
            data: values,
            borderColor: "#FFC72C",
            backgroundColor: "rgba(255, 199, 44, 0.3)",
            tension: 0.3,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: pointBackgroundColors,
            pointBorderColor: pointBorderColors,
            pointBorderWidth: 2
          }]
        };
        
        // tooltip callback에서 차트 객체에 저장된 sortedData를 사용
        chartOptions.plugins.tooltip.callbacks.title = function(context) {
          const dataIndex = context[0].dataIndex;
          const currentData = this.chart.currentSortedData || sortedData;
          if (dataIndex >= 0 && dataIndex < currentData.length) {
            const gameData = currentData[dataIndex];
            const date = gameData.날짜;
            const opponent = gameData.상대팀 || gameData.상대 || gameData.VS || gameData.vs;
            if (opponent) {
              return `${date} vs ${opponent}`;
            }
            return date;
          }
          return "";
        };
        chartOptions.plugins.tooltip.callbacks.afterLabel = function(context) {
          const dataIndex = context.dataIndex;
          const currentData = this.chart.currentSortedData || sortedData;
          if (dataIndex >= 0 && dataIndex < currentData.length) {
            const gameData = currentData[dataIndex];
            const isWeekend = gameData.is_weekend;
            const opponent = gameData.상대팀 || gameData.상대 || gameData.VS || gameData.vs;
            let result = isWeekend ? "주말 (토·일)" : "주중 (월~금)";
            if (opponent) {
              result += `\n상대팀: ${opponent}`;
            }
            return result;
          }
          return "";
        };
        
        crowdChart = new Chart(crowdCtx, {
          type: "line",
          data: chartData,
          options: chartOptions
        });
        // 차트 생성 후 sortedData 저장
        crowdChart.currentSortedData = sortedData;
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

    // 시즌별 주말/주중 평균 관중수 차트
    const weekendWeekdayCtx = document.getElementById("weekendWeekdayChart");
    if (weekendWeekdayCtx && data.season_weekend_avg && data.season_weekday_avg) {
      const seasons = Object.keys(data.season_weekend_avg).sort();
      const weekendValues = seasons.map(s => data.season_weekend_avg[s]);
      const weekdayValues = seasons.map(s => data.season_weekday_avg[s]);

      new Chart(weekendWeekdayCtx, {
        type: "bar",
        data: {
          labels: seasons,
          datasets: [
            {
              label: "주말 평균 (토·일)",
              data: weekendValues,
              backgroundColor: "#FFC72C",
              borderColor: "#FFC72C",
              borderWidth: 1
            },
            {
              label: "주중 평균 (월~금)",
              data: weekdayValues,
              backgroundColor: "rgba(255, 199, 44, 0.5)",
              borderColor: "rgba(255, 199, 44, 0.8)",
              borderWidth: 1
            }
          ]
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
  })
  .catch(err => {
    console.error("JSON 로드 실패 (crowd):", err);
  });

// 경쟁사/리그 벤치마킹 차트
fetch("kbl_benchmark.json")
  .then(res => res.json())
  .then(benchmarkData => {
    // LG 세이커스 데이터도 함께 로드
    return fetch("lg_crowd_clean.json")
      .then(res => res.json())
      .then(lgData => {
        // LG 세이커스 vs 리그 평균 관중수 비교 차트
        const lgVsLeagueCtx = document.getElementById("lgVsLeagueChart");
        if (lgVsLeagueCtx) {
          const seasons = Object.keys(lgData.season_avg).sort();
          const lgValues = seasons.map(s => lgData.season_avg[s]);
          const leagueValues = seasons.map(s => benchmarkData.league_avg_by_season[s] || 0);

          new Chart(lgVsLeagueCtx, {
            type: "line",
            data: {
              labels: seasons,
              datasets: [
                {
                  label: "LG 세이커스",
                  data: lgValues,
                  borderColor: "#FFC72C",
                  backgroundColor: "rgba(255, 199, 44, 0.1)",
                  tension: 0.3,
                  pointRadius: 4,
                  pointHoverRadius: 6
                },
                {
                  label: "KBL 리그 평균",
                  data: leagueValues,
                  borderColor: "#94A3B8",
                  backgroundColor: "rgba(148, 163, 184, 0.1)",
                  tension: 0.3,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  borderDash: [5, 5]
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  labels: { color: "#E5E7EB", font: { size: 10 } }
                },
                tooltip: {
                  callbacks: {
                    afterLabel: function(context) {
                      const lgValue = lgValues[context.dataIndex];
                      const leagueValue = leagueValues[context.dataIndex];
                      const diff = lgValue - leagueValue;
                      const diffPercent = ((diff / leagueValue) * 100).toFixed(1);
                      return `차이: ${diff > 0 ? '+' : ''}${diff.toLocaleString()}명 (${diffPercent}%)`;
                    }
                  }
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

        // 2024-2025 시즌 구단별 관중수 랭킹 차트
        const teamRankingCtx = document.getElementById("teamRankingChart");
        if (teamRankingCtx) {
          const teams = benchmarkData.team_ranking_2024_2025.map(t => t.team);
          const attendances = benchmarkData.team_ranking_2024_2025.map(t => t.avg_attendance);
          
          // LG 세이커스 강조를 위한 색상 배열
          const colors = teams.map((team, index) => 
            team === "창원 LG" ? "#FFC72C" : 
            index < 3 ? "#60A5FA" : "#94A3B8"
          );

          new Chart(teamRankingCtx, {
            type: "bar",
            data: {
              labels: teams,
              datasets: [{
                label: "평균 관중수",
                data: attendances,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    afterLabel: function(context) {
                      const team = teams[context.dataIndex];
                      const lgAttendance = lgData.season_avg["2024-2025"];
                      const teamAttendance = attendances[context.dataIndex];
                      if (team !== "창원 LG") {
                        const diff = teamAttendance - lgAttendance;
                        return `LG 대비: ${diff > 0 ? '+' : ''}${diff.toLocaleString()}명`;
                      }
                      return "";
                    }
                  }
                }
              },
              scales: {
                x: {
                  ticks: { color: "#E5E7EB", font: { size: 10 } },
                  grid: { color: "rgba(148, 163, 184, 0.2)" },
                  beginAtZero: true
                },
                y: {
                  ticks: { color: "#E5E7EB", font: { size: 10 } },
                  grid: { display: false }
                }
              }
            }
          });
        }
      });
  })
  .catch(err => {
    console.error("JSON 로드 실패 (benchmark):", err);
  });

// 시즌별 트렌드 & 인사이트 차트
fetch("season_trends.json")
  .then(res => res.json())
  .then(trendData => {
    // 라운드별 관중수 패턴 차트 (2024-2025, 2025-2026 시즌 비교)
    const roundCtx = document.getElementById("roundChart");
    if (roundCtx) {
      // 2024-2025 시즌 데이터
      const rounds2024 = trendData.round_avg_2024_2025 ? Object.keys(trendData.round_avg_2024_2025).sort() : [];
      const values2024 = rounds2024.map(r => trendData.round_avg_2024_2025[r].avg_attendance);
      const gameCounts2024 = rounds2024.map(r => trendData.round_avg_2024_2025[r].game_count);
      
      // 2025-2026 시즌 데이터
      const rounds2025 = trendData.round_avg_2025_2026 ? Object.keys(trendData.round_avg_2025_2026).sort() : [];
      const values2025 = rounds2025.map(r => trendData.round_avg_2025_2026[r].avg_attendance);
      const gameCounts2025 = rounds2025.map(r => trendData.round_avg_2025_2026[r].game_count);
      
      // 모든 라운드 통합 (두 시즌 모두 포함)
      const allRounds = [...new Set([...rounds2024, ...rounds2025])].sort((a, b) => {
        const numA = parseInt(a.replace('라운드', ''));
        const numB = parseInt(b.replace('라운드', ''));
        return numA - numB;
      });
      const roundLabels = allRounds.map(r => r.replace('라운드', 'R'));
      
      // 각 라운드별로 데이터 매핑 (없는 라운드는 null)
      const data2024 = allRounds.map(r => {
        const idx = rounds2024.indexOf(r);
        return idx >= 0 ? values2024[idx] : null;
      });
      const data2025 = allRounds.map(r => {
        const idx = rounds2025.indexOf(r);
        return idx >= 0 ? values2025[idx] : null;
      });
      
      // 게임 수 매핑
      const gameCounts2024Mapped = allRounds.map(r => {
        const idx = rounds2024.indexOf(r);
        return idx >= 0 ? gameCounts2024[idx] : 0;
      });
      const gameCounts2025Mapped = allRounds.map(r => {
        const idx = rounds2025.indexOf(r);
        return idx >= 0 ? gameCounts2025[idx] : 0;
      });

      // 시즌 평균 계산
      const seasonAvg2024 = trendData.season_trends["2024-2025"] ? trendData.season_trends["2024-2025"].total_avg : 0;
      const seasonAvg2025 = trendData.season_trends["2025-2026"] ? trendData.season_trends["2025-2026"].total_avg : (trendData.round_avg_2025_2026 ? 
        Math.round(Object.values(trendData.round_avg_2025_2026).reduce((sum, r) => sum + r.avg_attendance * r.game_count, 0) / 
        Object.values(trendData.round_avg_2025_2026).reduce((sum, r) => sum + r.game_count, 0)) : 0);

      new Chart(roundCtx, {
        type: "bar",
        data: {
          labels: roundLabels,
          datasets: [
            {
              label: "2024-2025 시즌",
              data: data2024,
              backgroundColor: "rgba(255, 199, 44, 0.6)",
              borderColor: "#FFC72C",
              borderWidth: 2
            },
            {
              label: "2025-2026 시즌",
              data: data2025,
              backgroundColor: "rgba(148, 163, 184, 0.6)",
              borderColor: "#94A3B8",
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: "#E5E7EB",
                font: { size: 11 }
              }
            },
            tooltip: {
              callbacks: {
                title: function(context) {
                  return `R${context[0].label}`;
                },
                label: function(context) {
                  const datasetLabel = context.dataset.label;
                  const value = context.parsed.y;
                  const roundIdx = context.dataIndex;
                  let gameCount = 0;
                  if (datasetLabel === "2024-2025 시즌") {
                    gameCount = gameCounts2024Mapped[roundIdx];
                  } else {
                    gameCount = gameCounts2025Mapped[roundIdx];
                  }
                  return `${datasetLabel}: ${value.toLocaleString()}명 (${gameCount}경기)`;
                },
                afterLabel: function(context) {
                  const datasetLabel = context.dataset.label;
                  const value = context.parsed.y;
                  const roundIdx = context.dataIndex;
                  const seasonAvg = datasetLabel === "2024-2025 시즌" ? seasonAvg2024 : seasonAvg2025;
                  if (seasonAvg > 0 && value !== null) {
                    const diff = value - seasonAvg;
                    const diffPercent = ((diff / seasonAvg) * 100).toFixed(1);
                    return `시즌 평균 대비: ${diff > 0 ? '+' : ''}${diff.toLocaleString()}명 (${diffPercent}%)`;
                  }
                  return '';
                }
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
              grid: { color: "rgba(148, 163, 184, 0.2)" },
              beginAtZero: true
            }
          }
        }
      });
    }

    // 월별 관중수 트렌드 차트
    const monthlyTrendCtx = document.getElementById("monthlyTrendChart");
    if (monthlyTrendCtx && trendData.monthly_avg_2024_2025) {
      const months = Object.keys(trendData.monthly_avg_2024_2025).sort();
      const monthLabels = months.map(m => {
        const [year, month] = m.split('-');
        const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        return `${year}년 ${monthNames[parseInt(month)]}`;
      });
      const values = months.map(m => trendData.monthly_avg_2024_2025[m]);

      new Chart(monthlyTrendCtx, {
        type: "line",
        data: {
          labels: monthLabels,
          datasets: [{
            label: "월별 평균 관중수",
            data: values,
            borderColor: "#FFC72C",
            backgroundColor: "rgba(255, 199, 44, 0.1)",
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true
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

    // 특별 이벤트 목록 표시
    const specialEventsList = document.getElementById("specialEventsList");
    if (specialEventsList && trendData.special_events_2024_2025) {
      const events = trendData.special_events_2024_2025;
      const seasonAvg = trendData.season_trends["2024-2025"].total_avg;
      
      events.forEach((event, index) => {
        const date = new Date(event.date);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        const diff = event.attendance - seasonAvg;
        const diffPercent = ((diff / seasonAvg) * 100).toFixed(1);
        
        const eventDiv = document.createElement("div");
        eventDiv.className = "flex items-center justify-between p-2 bg-white/5 rounded-lg";
        eventDiv.innerHTML = `
          <div>
            <span class="text-yellow-300 font-semibold">${dateStr}</span>
            <span class="text-slate-400 ml-2">${event.is_weekend ? '주말' : '주중'}</span>
          </div>
          <div class="text-right">
            <div class="text-white font-semibold">${event.attendance.toLocaleString()}명</div>
            <div class="text-emerald-400 text-[10px]">+${diffPercent}%</div>
          </div>
        `;
        specialEventsList.appendChild(eventDiv);
      });
    }

    // 세이커스데이 이전/이후 평균 관중수 비교 차트 (2024-2025 시즌)
    const weekdayEventCtx = document.getElementById("weekdayEventChart");
    if (weekdayEventCtx) {
      // LG 세이커스 데이터도 함께 로드
      fetch("lg_crowd_clean.json")
        .then(res => res.json())
        .then(lgData => {
          // 2024-2025 시즌 데이터에서 12월 28일 전후로 나누기
          const seasonGames = lgData.game_by_game.filter(game => {
            const date = game.날짜;
            // 2024-10-01부터 2025-04-30까지가 2024-2025 시즌
            return date >= '2024-10-01' && date < '2025-05-01';
          });

          const beforeDate = '2024-12-28';
          const beforeGames = seasonGames.filter(g => g.날짜 < beforeDate);
          const afterGames = seasonGames.filter(g => g.날짜 >= beforeDate);

          const beforeAvg = beforeGames.length > 0 
            ? Math.round(beforeGames.reduce((sum, g) => sum + g.관중수, 0) / beforeGames.length)
            : 0;
          const afterAvg = afterGames.length > 0
            ? Math.round(afterGames.reduce((sum, g) => sum + g.관중수, 0) / afterGames.length)
            : 0;

          const diff = afterAvg - beforeAvg;
          const diffPercent = beforeAvg > 0 ? ((diff / beforeAvg) * 100).toFixed(1) : 0;

          new Chart(weekdayEventCtx, {
            type: "bar",
            data: {
              labels: ["세이커스데이 이전\n(2024-12-28 이전)", "세이커스데이 이후\n(2024-12-28 이후)"],
              datasets: [{
                label: "평균 관중수",
                data: [beforeAvg, afterAvg],
                backgroundColor: ["#94A3B8", "#FFC72C"],
                borderColor: ["#64748B", "#FFC72C"],
                borderWidth: 2
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `평균 관중수: ${context.parsed.y.toLocaleString()}명`;
                    },
                    afterLabel: function(context) {
                      if (context.dataIndex === 1) {
                        return `세이커스데이 이전 대비: ${diff > 0 ? '+' : ''}${diff.toLocaleString()}명 (${diffPercent > 0 ? '+' : ''}${diffPercent}%)`;
                      } else if (context.dataIndex === 0) {
                        return `경기 수: ${beforeGames.length}경기`;
                      }
                      return `경기 수: ${afterGames.length}경기`;
                    }
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
                  grid: { color: "rgba(148, 163, 184, 0.2)" },
                  beginAtZero: true
                }
              }
            }
          });
        })
        .catch(err => {
          console.error("JSON 로드 실패 (lg_crowd for sakers day):", err);
        });
    }
  })
  .catch(err => {
    console.error("JSON 로드 실패 (trends):", err);
  });

// 케이스스터디 화면 전환 로직
const mainContainer = document.getElementById("mainContainer");
const caseStudyContainer = document.getElementById("caseStudyContainer");
const navLinks = document.querySelectorAll(".nav-link");
const caseStudyLink = document.querySelector('a[href="#casestudy"]');
const backToMainBtn = document.getElementById("backToMainBtn");

// 케이스스터디 링크 클릭 시 화면 전환
if (caseStudyLink) {
  caseStudyLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (mainContainer) mainContainer.classList.add("hidden");
    if (caseStudyContainer) caseStudyContainer.classList.remove("hidden");
    window.scrollTo(0, 0);
  });
}

// 메인으로 돌아가기 버튼
if (backToMainBtn) {
  backToMainBtn.addEventListener("click", () => {
    if (mainContainer) mainContainer.classList.remove("hidden");
    if (caseStudyContainer) caseStudyContainer.classList.add("hidden");
    window.scrollTo(0, 0);
  });
}

// 전북현대 데이터
const jeonbukData = [
  { season: "24시즌", attendance: 295642, games: 19 },
  { season: "23시즌", attendance: 238759, games: 19 },
  { season: "22시즌", attendance: 114328, games: 19 },
  { season: "21시즌", attendance: 82471, games: 19 },
  { season: "20시즌", attendance: 16808, games: 14 },
  { season: "19시즌", attendance: 278738, games: 20 },
  { season: "18시즌", attendance: 226224, games: 19 },
  { season: "17시즌", attendance: 221579, games: 19 },
  { season: "16시즌", attendance: 318921, games: 19 },
  { season: "15시즌", attendance: 330856, games: 19 },
  { season: "14시즌", attendance: 249954, games: 19 },
  { season: "13시즌", attendance: 193060, games: 19 }
];

// 전북현대 차트 초기화
let jeonbukChart = null;
const jeonbukCtx = document.getElementById("jeonbukChart");
if (jeonbukCtx) {
  const jeonbukLabels = jeonbukData.map(d => d.season);
  const jeonbukValues = jeonbukData.map(d => d.attendance);
  const jeonbukAvgPerGame = jeonbukData.map(d => Math.round(d.attendance / d.games));

  jeonbukChart = new Chart(jeonbukCtx, {
    type: "bar",
    data: {
      labels: jeonbukLabels,
      datasets: [
        {
          label: "총 관중수",
          data: jeonbukValues,
          backgroundColor: "#00A651",
          borderColor: "#00A651",
          borderWidth: 2,
          yAxisID: "y"
        },
        {
          label: "경기당 평균 관중수",
          data: jeonbukAvgPerGame,
          type: "line",
          borderColor: "#7DD3FC",
          backgroundColor: "rgba(125, 211, 252, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: "y1"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#E5E7EB", font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const index = context.dataIndex;
              const data = jeonbukData[index];
              if (context.datasetIndex === 0) {
                return `경기수: ${data.games}경기\n경기당 평균: ${Math.round(data.attendance / data.games).toLocaleString()}명`;
              }
              return `총 관중수: ${data.attendance.toLocaleString()}명`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#E5E7EB", font: { size: 10 } },
          grid: { color: "rgba(148, 163, 184, 0.2)" }
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          ticks: { color: "#00A651", font: { size: 10 } },
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          beginAtZero: true,
          title: {
            display: true,
            text: "총 관중수",
            color: "#00A651"
          }
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          ticks: { color: "#7DD3FC", font: { size: 10 } },
          grid: { drawOnChartArea: false },
          beginAtZero: true,
          title: {
            display: true,
            text: "경기당 평균",
            color: "#7DD3FC"
          }
        }
      }
    }
  });
}

// 전북현대 테이블 생성
const jeonbukTableBody = document.getElementById("jeonbukTableBody");
if (jeonbukTableBody) {
  jeonbukTableBody.innerHTML = "";
  jeonbukData.forEach(data => {
    const avgPerGame = Math.round(data.attendance / data.games);
    const row = document.createElement("tr");
    row.className = "border-b border-white/5 hover:bg-white/5";
    row.innerHTML = `
      <td class="py-3 px-4 font-semibold">${data.season}</td>
      <td class="py-3 px-4 text-right">${data.attendance.toLocaleString()}명</td>
      <td class="py-3 px-4 text-right">${data.games}경기</td>
      <td class="py-3 px-4 text-right" style="color: #00A651;">${avgPerGame.toLocaleString()}명</td>
    `;
    jeonbukTableBody.appendChild(row);
  });
}

// 전북현대 통계 업데이트
function updateJeonbukStats() {
  // 최고 관중수
  const maxData = jeonbukData.reduce((max, d) => d.attendance > max.attendance ? d : max, jeonbukData[0]);
  const maxSeasonEl = document.getElementById("jeonbukMaxSeason");
  const maxSeasonLabelEl = document.getElementById("jeonbukMaxSeasonLabel");
  if (maxSeasonEl) maxSeasonEl.textContent = `${maxData.attendance.toLocaleString()}명`;
  if (maxSeasonLabelEl) maxSeasonLabelEl.textContent = `${maxData.season} (${maxData.games}경기)`;

  // 최근 시즌
  const latestData = jeonbukData[jeonbukData.length - 1];
  const latestSeasonEl = document.getElementById("jeonbukLatestSeason");
  const latestSeasonLabelEl = document.getElementById("jeonbukLatestSeasonLabel");
  if (latestSeasonEl) latestSeasonEl.textContent = `${latestData.attendance.toLocaleString()}명`;
  if (latestSeasonLabelEl) latestSeasonLabelEl.textContent = `${latestData.season} (${latestData.games}경기)`;

  // 전체 평균 계산
  const totalAvg = Math.round(jeonbukData.reduce((sum, d) => sum + d.attendance, 0) / jeonbukData.length);
  const totalAvgEl = document.getElementById("jeonbukTotalAvg");
  if (totalAvgEl) totalAvgEl.textContent = `${totalAvg.toLocaleString()}명`;
}

// 전북현대 기간 선택 기능
const jeonbukStartSeasonSelect = document.getElementById("jeonbukStartSeason");
const jeonbukEndSeasonSelect = document.getElementById("jeonbukEndSeason");
const jeonbukApplyRangeBtn = document.getElementById("jeonbukApplyRange");
const jeonbukSelectedAvgEl = document.getElementById("jeonbukSelectedAvg");
const jeonbukSelectedRangeEl = document.getElementById("jeonbukSelectedRange");

// 시즌 선택 드롭다운 생성
if (jeonbukStartSeasonSelect && jeonbukEndSeasonSelect) {
  jeonbukData.forEach((data, index) => {
    const option1 = document.createElement("option");
    option1.value = index;
    option1.textContent = data.season;
    jeonbukStartSeasonSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = index;
    option2.textContent = data.season;
    jeonbukEndSeasonSelect.appendChild(option2);
  });

  // 기본값 설정 (전체 범위)
  jeonbukStartSeasonSelect.value = 0;
  jeonbukEndSeasonSelect.value = jeonbukData.length - 1;
}

// 전북현대 기간 선택 적용 함수
function applyJeonbukSeasonRange() {
  if (!jeonbukStartSeasonSelect || !jeonbukEndSeasonSelect) return;

  const startIndex = parseInt(jeonbukStartSeasonSelect.value);
  const endIndex = parseInt(jeonbukEndSeasonSelect.value);

  if (startIndex > endIndex) {
    alert("시작 시즌이 끝 시즌보다 늦을 수 없습니다.");
    return;
  }

  const selectedData = jeonbukData.slice(startIndex, endIndex + 1);
  const avg = Math.round(selectedData.reduce((sum, d) => sum + d.attendance, 0) / selectedData.length);
  const startSeason = jeonbukData[startIndex].season;
  const endSeason = jeonbukData[endIndex].season;

  // 선택 기간 평균 표시
  if (jeonbukSelectedAvgEl) jeonbukSelectedAvgEl.textContent = `${avg.toLocaleString()}명`;
  if (jeonbukSelectedRangeEl) jeonbukSelectedRangeEl.textContent = `${startSeason} ~ ${endSeason} (${selectedData.length}시즌)`;

  // 차트에서 선택된 기간 강조
  if (jeonbukChart) {
    const colors = jeonbukData.map((d, index) => 
      (index >= startIndex && index <= endIndex) ? "#34D399" : "#00A651"
    );
    jeonbukChart.data.datasets[0].backgroundColor = colors;
    jeonbukChart.data.datasets[0].borderColor = colors;
    jeonbukChart.update();
  }
}

// 전북현대 적용 버튼 클릭 이벤트
if (jeonbukApplyRangeBtn) {
  jeonbukApplyRangeBtn.addEventListener("click", applyJeonbukSeasonRange);
}

// 전북현대 초기 통계 업데이트
updateJeonbukStats();

// KB스타즈 데이터
const kbStarsData = [
  { season: "2011-2012", attendance: 43086 },
  { season: "12-13", attendance: 29616 },
  { season: "13-14", attendance: 39372 },
  { season: "14-15", attendance: 39234 },
  { season: "15-16", attendance: 36914 },
  { season: "16-17", attendance: 27578 },
  { season: "17-18", attendance: 30598 },
  { season: "18-19", attendance: 37534 },
  { season: "19-20", attendance: 22612 },
  { season: "20-21", attendance: 2282 },
  { season: "21-22", attendance: 15396 },
  { season: "22-23", attendance: 21006 },
  { season: "23-24", attendance: 36118 },
  { season: "24-25", attendance: 32895 }
];

// KB스타즈 차트 초기화
let kbStarsChart = null;
const kbStarsCtx = document.getElementById("kbStarsChart");
if (kbStarsCtx) {
  const kbStarsLabels = kbStarsData.map(d => d.season);
  const kbStarsValues = kbStarsData.map(d => d.attendance);

  kbStarsChart = new Chart(kbStarsCtx, {
    type: "bar",
    data: {
      labels: kbStarsLabels,
      datasets: [{
        label: "관중수",
        data: kbStarsValues,
        backgroundColor: "#FFC72C",
        borderColor: "#FFC72C",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#E5E7EB", font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `관중수: ${context.parsed.y.toLocaleString()}명`;
            }
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
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          beginAtZero: true,
          title: {
            display: true,
            text: "관중수",
            color: "#FFC72C"
          }
        }
      }
    }
  });
}

// KB스타즈 통계 계산 및 표시
function updateKBStarsStats() {
  // 최고 관중수
  const maxData = kbStarsData.reduce((max, d) => d.attendance > max.attendance ? d : max, kbStarsData[0]);
  const maxSeasonEl = document.getElementById("kbMaxSeason");
  const maxSeasonLabelEl = document.getElementById("kbMaxSeasonLabel");
  if (maxSeasonEl) maxSeasonEl.textContent = `${maxData.attendance.toLocaleString()}명`;
  if (maxSeasonLabelEl) maxSeasonLabelEl.textContent = maxData.season;

  // 최근 시즌
  const latestData = kbStarsData[kbStarsData.length - 1];
  const latestSeasonEl = document.getElementById("kbLatestSeason");
  const latestSeasonLabelEl = document.getElementById("kbLatestSeasonLabel");
  if (latestSeasonEl) latestSeasonEl.textContent = `${latestData.attendance.toLocaleString()}명`;
  if (latestSeasonLabelEl) latestSeasonLabelEl.textContent = latestData.season;

  // 전체 평균
  const totalAvg = Math.round(kbStarsData.reduce((sum, d) => sum + d.attendance, 0) / kbStarsData.length);
  const totalAvgEl = document.getElementById("kbTotalAvg");
  if (totalAvgEl) totalAvgEl.textContent = `${totalAvg.toLocaleString()}명`;
}

// KB스타즈 테이블 생성
const kbStarsTableBody = document.getElementById("kbStarsTableBody");
if (kbStarsTableBody) {
  kbStarsTableBody.innerHTML = "";
  kbStarsData.forEach(data => {
    const row = document.createElement("tr");
    row.className = "border-b border-white/5 hover:bg-white/5";
    row.innerHTML = `
      <td class="py-3 px-4 font-semibold">${data.season}</td>
      <td class="py-3 px-4 text-right" style="color: #FFC72C;">${data.attendance.toLocaleString()}명</td>
    `;
    kbStarsTableBody.appendChild(row);
  });
}

// KB스타즈 기간 선택 기능
const kbStartSeasonSelect = document.getElementById("kbStartSeason");
const kbEndSeasonSelect = document.getElementById("kbEndSeason");
const kbApplyRangeBtn = document.getElementById("kbApplyRange");
const kbSelectedAvgEl = document.getElementById("kbSelectedAvg");
const kbSelectedRangeEl = document.getElementById("kbSelectedRange");

// 시즌 선택 드롭다운 생성
if (kbStartSeasonSelect && kbEndSeasonSelect) {
  kbStarsData.forEach((data, index) => {
    const option1 = document.createElement("option");
    option1.value = index;
    option1.textContent = data.season;
    kbStartSeasonSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = index;
    option2.textContent = data.season;
    kbEndSeasonSelect.appendChild(option2);
  });

  // 기본값 설정 (전체 범위)
  kbStartSeasonSelect.value = 0;
  kbEndSeasonSelect.value = kbStarsData.length - 1;
}

// 기간 선택 적용 함수
function applyKBSeasonRange() {
  if (!kbStartSeasonSelect || !kbEndSeasonSelect) return;

  const startIndex = parseInt(kbStartSeasonSelect.value);
  const endIndex = parseInt(kbEndSeasonSelect.value);

  if (startIndex > endIndex) {
    alert("시작 시즌이 끝 시즌보다 늦을 수 없습니다.");
    return;
  }

  const selectedData = kbStarsData.slice(startIndex, endIndex + 1);
  const avg = Math.round(selectedData.reduce((sum, d) => sum + d.attendance, 0) / selectedData.length);
  const startSeason = kbStarsData[startIndex].season;
  const endSeason = kbStarsData[endIndex].season;

  // 선택 기간 평균 표시
  if (kbSelectedAvgEl) kbSelectedAvgEl.textContent = `${avg.toLocaleString()}명`;
  if (kbSelectedRangeEl) kbSelectedRangeEl.textContent = `${startSeason} ~ ${endSeason} (${selectedData.length}시즌)`;

  // 차트에서 선택된 기간 강조
  if (kbStarsChart) {
    const colors = kbStarsData.map((d, index) => 
      (index >= startIndex && index <= endIndex) ? "#FCD34D" : "#FFC72C"
    );
    kbStarsChart.data.datasets[0].backgroundColor = colors;
    kbStarsChart.data.datasets[0].borderColor = colors;
    kbStarsChart.update();
  }
}

// 적용 버튼 클릭 이벤트
if (kbApplyRangeBtn) {
  kbApplyRangeBtn.addEventListener("click", applyKBSeasonRange);
}

// 초기 통계 업데이트
updateKBStarsStats();

// SSG 랜더스 데이터
const ssgData = [
  {
    year: "2021년",
    total: 105534,
    avgPerGame: 2574,
    weekdays: {
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: null,
      sun: null
    }
  },
  {
    year: "2022년",
    total: 981546,
    avgPerGame: 13633,
    weekdays: {
      tue: 7654,
      wed: 8120,
      thu: 8410,
      fri: 13850,
      sat: 19850,
      sun: 17200
    }
  },
  {
    year: "2023년",
    total: 1068211,
    avgPerGame: 14836,
    weekdays: {
      tue: 9215,
      wed: 9840,
      thu: 11353,
      fri: 14920,
      sat: 21500,
      sun: 18950
    }
  },
  {
    year: "2024년",
    total: 1143773,
    avgPerGame: 15886,
    weekdays: {
      tue: 10872,
      wed: 11250,
      thu: 13311,
      fri: 16550,
      sat: 22100,
      sun: 20450
    }
  },
  {
    year: "2025년",
    total: 1281093,
    avgPerGame: 17793,
    weekdays: {
      tue: 12940,
      wed: 13210,
      thu: 14470,
      fri: 18920,
      sat: 22950,
      sun: 22600
    }
  }
];

// SSG 랜더스 연도별 총 관중수 차트
let ssgTotalChart = null;
const ssgTotalCtx = document.getElementById("ssgTotalChart");
if (ssgTotalCtx) {
  const labels = ssgData.map(d => d.year);
  const values = ssgData.map(d => d.total);

  ssgTotalChart = new Chart(ssgTotalCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "총 관중수",
        data: values,
        backgroundColor: "#C8102E",
        borderColor: "#C8102E",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#E5E7EB", font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `총 관중수: ${context.parsed.y.toLocaleString()}명`;
            }
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
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          beginAtZero: true,
          title: {
            display: true,
            text: "총 관중수",
            color: "#C8102E"
          }
        }
      }
    }
  });
}

// SSG 랜더스 연도별 경기당 평균 차트
const ssgAvgCtx = document.getElementById("ssgAvgChart");
if (ssgAvgCtx) {
  const labels = ssgData.map(d => d.year);
  const values = ssgData.map(d => d.avgPerGame);

  new Chart(ssgAvgCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "경기당 평균 관중수",
        data: values,
        borderColor: "#C8102E",
        backgroundColor: "rgba(200, 16, 46, 0.1)",
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#E5E7EB", font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `경기당 평균: ${context.parsed.y.toLocaleString()}명`;
            }
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
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          beginAtZero: true,
          title: {
            display: true,
            text: "경기당 평균 관중수",
            color: "#C8102E"
          }
        }
      }
    }
  });
}

// SSG 랜더스 요일별 평균 관중수 차트 (평일 vs 주말)
const ssgWeekdayCtx = document.getElementById("ssgWeekdayChart");
if (ssgWeekdayCtx) {
  const weekdayLabels = ["평일 (화~목)", "주말 (금~일)"];
  const years = ssgData.filter(d => d.weekdays.tue !== null).map(d => d.year);
  
  const datasets = years.map((year, yearIndex) => {
    const dataIndex = ssgData.findIndex(d => d.year === year);
    const data = ssgData[dataIndex];
    
    // 평일 평균 (화, 수, 목)
    const weekdayAvg = Math.round((data.weekdays.tue + data.weekdays.wed + data.weekdays.thu) / 3);
    // 주말 평균 (금, 토, 일)
    const weekendAvg = Math.round((data.weekdays.fri + data.weekdays.sat + data.weekdays.sun) / 3);
    
    const colors = ["#EF4444", "#F87171", "#FCA5A5", "#FECACA", "#FEE2E2"];
    return {
      label: year,
      data: [weekdayAvg, weekendAvg],
      borderColor: colors[yearIndex % colors.length],
      backgroundColor: colors[yearIndex % colors.length] + "40",
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7
    };
  });

  new Chart(ssgWeekdayCtx, {
    type: "bar",
    data: {
      labels: weekdayLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#E5E7EB", font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}명`;
            },
            afterLabel: function(context) {
              const yearIndex = context.datasetIndex;
              const dataIndex = ssgData.findIndex(d => d.year === years[yearIndex]);
              const data = ssgData[dataIndex];
              
              if (context.dataIndex === 0) {
                // 평일 상세 정보
                return `화: ${data.weekdays.tue.toLocaleString()}명\n수: ${data.weekdays.wed.toLocaleString()}명\n목: ${data.weekdays.thu.toLocaleString()}명`;
              } else {
                // 주말 상세 정보
                return `금: ${data.weekdays.fri.toLocaleString()}명\n토: ${data.weekdays.sat.toLocaleString()}명\n일: ${data.weekdays.sun.toLocaleString()}명`;
              }
            }
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
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          beginAtZero: true,
          title: {
            display: true,
            text: "평균 관중수",
            color: "#C8102E"
          }
        }
      }
    }
  });
}

// SSG 랜더스 통계 업데이트
function updateSSGStats() {
  // 최고 총 관중수
  const maxTotal = ssgData.reduce((max, d) => d.total > max.total ? d : max, ssgData[0]);
  const maxTotalEl = document.getElementById("ssgMaxTotal");
  const maxTotalYearEl = document.getElementById("ssgMaxTotalYear");
  if (maxTotalEl) maxTotalEl.textContent = `${maxTotal.total.toLocaleString()}명`;
  if (maxTotalYearEl) maxTotalYearEl.textContent = maxTotal.year;

  // 최고 경기당 평균
  const maxAvg = ssgData.reduce((max, d) => d.avgPerGame > max.avgPerGame ? d : max, ssgData[0]);
  const maxAvgEl = document.getElementById("ssgMaxAvg");
  const maxAvgYearEl = document.getElementById("ssgMaxAvgYear");
  if (maxAvgEl) maxAvgEl.textContent = `${maxAvg.avgPerGame.toLocaleString()}명`;
  if (maxAvgYearEl) maxAvgYearEl.textContent = maxAvg.year;

  // 전체 시즌 총 관중
  const totalAttendance = ssgData.reduce((sum, d) => sum + d.total, 0);
  const totalAttendanceEl = document.getElementById("ssgTotalAttendance");
  if (totalAttendanceEl) totalAttendanceEl.textContent = `${totalAttendance.toLocaleString()}명`;

  // 전체 시즌 경기당 평균
  const totalAvg = Math.round(ssgData.reduce((sum, d) => sum + d.avgPerGame, 0) / ssgData.length);
  const totalAvgEl = document.getElementById("ssgTotalAvg");
  if (totalAvgEl) totalAvgEl.textContent = `${totalAvg.toLocaleString()}명`;
}

// SSG 랜더스 테이블 생성
const ssgTableBody = document.getElementById("ssgTableBody");
if (ssgTableBody) {
  ssgTableBody.innerHTML = "";
  ssgData.forEach(data => {
    const row = document.createElement("tr");
    row.className = "border-b border-white/5 hover:bg-white/5";
    row.innerHTML = `
      <td class="py-3 px-4 font-semibold">${data.year}</td>
      <td class="py-3 px-4 text-right" style="color: #C8102E;">${data.total.toLocaleString()}명</td>
      <td class="py-3 px-4 text-right" style="color: #C8102E;">${data.avgPerGame.toLocaleString()}명</td>
      <td class="py-3 px-4 text-right">${data.weekdays.tue ? data.weekdays.tue.toLocaleString() : '-'}</td>
      <td class="py-3 px-4 text-right">${data.weekdays.wed ? data.weekdays.wed.toLocaleString() : '-'}</td>
      <td class="py-3 px-4 text-right">${data.weekdays.thu ? data.weekdays.thu.toLocaleString() : '-'}</td>
      <td class="py-3 px-4 text-right">${data.weekdays.fri ? data.weekdays.fri.toLocaleString() : '-'}</td>
      <td class="py-3 px-4 text-right">${data.weekdays.sat ? data.weekdays.sat.toLocaleString() : '-'}</td>
      <td class="py-3 px-4 text-right">${data.weekdays.sun ? data.weekdays.sun.toLocaleString() : '-'}</td>
    `;
    ssgTableBody.appendChild(row);
  });
}

// SSG 랜더스 기간 선택 기능
const ssgStartYearSelect = document.getElementById("ssgStartYear");
const ssgEndYearSelect = document.getElementById("ssgEndYear");
const ssgApplyRangeBtn = document.getElementById("ssgApplyRange");
const ssgSelectedAvgEl = document.getElementById("ssgSelectedAvg");
const ssgSelectedRangeEl = document.getElementById("ssgSelectedRange");

// 연도 선택 드롭다운 생성
if (ssgStartYearSelect && ssgEndYearSelect) {
  ssgData.forEach((data, index) => {
    const option1 = document.createElement("option");
    option1.value = index;
    option1.textContent = data.year;
    ssgStartYearSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = index;
    option2.textContent = data.year;
    ssgEndYearSelect.appendChild(option2);
  });

  // 기본값 설정 (전체 범위)
  ssgStartYearSelect.value = 0;
  ssgEndYearSelect.value = ssgData.length - 1;
}

// SSG 랜더스 기간 선택 적용 함수
function applySSGYearRange() {
  if (!ssgStartYearSelect || !ssgEndYearSelect) return;

  const startIndex = parseInt(ssgStartYearSelect.value);
  const endIndex = parseInt(ssgEndYearSelect.value);

  if (startIndex > endIndex) {
    alert("시작 연도가 끝 연도보다 늦을 수 없습니다.");
    return;
  }

  const selectedData = ssgData.slice(startIndex, endIndex + 1);
  // 경기당 평균의 평균 계산
  const avg = Math.round(selectedData.reduce((sum, d) => sum + d.avgPerGame, 0) / selectedData.length);
  const startYear = ssgData[startIndex].year;
  const endYear = ssgData[endIndex].year;

  // 선택 기간 평균 표시
  if (ssgSelectedAvgEl) ssgSelectedAvgEl.textContent = `${avg.toLocaleString()}명`;
  if (ssgSelectedRangeEl) ssgSelectedRangeEl.textContent = `${startYear} ~ ${endYear} (${selectedData.length}년)`;

  // 차트에서 선택된 기간 강조
  if (ssgTotalChart) {
    const colors = ssgData.map((d, index) => 
      (index >= startIndex && index <= endIndex) ? "#F87171" : "#C8102E"
    );
    ssgTotalChart.data.datasets[0].backgroundColor = colors;
    ssgTotalChart.data.datasets[0].borderColor = colors;
    ssgTotalChart.update();
  }
}

// SSG 랜더스 적용 버튼 클릭 이벤트
if (ssgApplyRangeBtn) {
  ssgApplyRangeBtn.addEventListener("click", applySSGYearRange);
}

// SSG 랜더스 통계 초기화
updateSSGStats();

