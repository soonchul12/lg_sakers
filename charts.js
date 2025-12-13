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

      // 차트 업데이트 또는 생성
      if (crowdChart) {
        crowdChart.data.labels = labels;
        crowdChart.data.datasets[0].data = values;
        crowdChart.data.datasets[0].pointBackgroundColor = pointBackgroundColors;
        crowdChart.data.datasets[0].pointBorderColor = pointBorderColors;
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
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: pointBackgroundColors,
              pointBorderColor: pointBorderColors,
              pointBorderWidth: 2
            }]
          },
          options: {
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
                    const gameData = sortedData[dataIndex];
                    const date = gameData.날짜;
                    const opponent = gameData.상대팀 || gameData.상대 || gameData.VS || gameData.vs;
                    if (opponent) {
                      return `${date} vs ${opponent}`;
                    }
                    return date;
                  },
                  afterLabel: function(context) {
                    const dataIndex = context.dataIndex;
                    const isWeekend = sortedData[dataIndex].is_weekend;
                    const opponent = sortedData[dataIndex].상대팀 || sortedData[dataIndex].상대 || sortedData[dataIndex].VS || sortedData[dataIndex].vs;
                    let result = isWeekend ? "주말 (토·일)" : "주중 (월~금)";
                    if (opponent) {
                      result += `\n상대팀: ${opponent}`;
                    }
                    return result;
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
    // 라운드별 관중수 패턴 차트 (2024-2025 시즌)
    const roundCtx = document.getElementById("roundChart");
    if (roundCtx && trendData.round_avg_2024_2025) {
      const rounds = Object.keys(trendData.round_avg_2024_2025).sort();
      const roundLabels = rounds.map(r => r.replace('라운드', 'R'));
      const values = rounds.map(r => trendData.round_avg_2024_2025[r].avg_attendance);
      const gameCounts = rounds.map(r => trendData.round_avg_2024_2025[r].game_count);
      
      // 시즌 평균 계산
      const seasonAvg = trendData.season_trends["2024-2025"].total_avg;
      
      // 최고 관중수 라운드 강조를 위한 색상
      const maxValue = Math.max(...values);
      const colors = values.map(v => v === maxValue ? "#FFC72C" : "#94A3B8");
      const borderColors = values.map(v => v === maxValue ? "#FFC72C" : "#64748B");

      new Chart(roundCtx, {
        type: "bar",
        data: {
          labels: roundLabels,
          datasets: [{
            label: "평균 관중수",
            data: values,
            backgroundColor: colors,
            borderColor: borderColors,
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
                title: function(context) {
                  return `${rounds[context[0].dataIndex]} (${gameCounts[context[0].dataIndex]}경기)`;
                },
                afterLabel: function(context) {
                  const avg = seasonAvg;
                  const diff = values[context.dataIndex] - avg;
                  const diffPercent = ((diff / avg) * 100).toFixed(1);
                  return `시즌 평균 대비: ${diff > 0 ? '+' : ''}${diff.toLocaleString()}명 (${diffPercent}%)`;
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

    // 평일 이벤트 효과 비교 차트 (2025-12-04 목요일)
    const weekdayEventCtx = document.getElementById("weekdayEventChart");
    if (weekdayEventCtx) {
      // LG 세이커스 데이터도 함께 로드
      fetch("lg_crowd_clean.json")
        .then(res => res.json())
        .then(lgData => {
          const weekdayAvg = lgData.season_weekday_avg["2025-2026"];
          const eventAttendance = 2984; // 2025-12-04 목요일 이벤트 관중수
          const diff = eventAttendance - weekdayAvg;
          const diffPercent = ((diff / weekdayAvg) * 100).toFixed(1);

          new Chart(weekdayEventCtx, {
            type: "bar",
            data: {
              labels: ["2025-2026 시즌\n평일 평균 관중수", "이벤트 날 관중수\n(2025-12-04 목)"],
              datasets: [{
                label: "관중수",
                data: [weekdayAvg, eventAttendance],
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
                    afterLabel: function(context) {
                      if (context.dataIndex === 1) {
                        return `평일 평균 대비: ${diff > 0 ? '+' : ''}${diff.toLocaleString()}명 (${diffPercent}%)`;
                      }
                      return "";
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
          console.error("JSON 로드 실패 (lg_crowd for weekday event):", err);
        });
    }
  })
  .catch(err => {
    console.error("JSON 로드 실패 (trends):", err);
  });

