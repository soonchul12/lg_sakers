import pandas as pd
import json
from collections import defaultdict

# Excel 파일 읽기
df = pd.read_excel("lg_crowd.xlsx", engine='openpyxl')

# 시즌 시작 연도 구하기
def get_start_year(season_str):
    try:
        return int(season_str.split("-")[0])
    except:
        return 2025

# 날짜 변환 함수
def fix_date(row):
    raw_date = row["날짜"]
    season = str(row["시즌"])
    start_year = get_start_year(season)

    try:
        if isinstance(raw_date, float):
            date_str = f"{raw_date:.2f}"
            parts = date_str.split(".")
            m = int(parts[0])
            decimal_part = float("0." + parts[1])
            d = round(decimal_part * 100)
        else:
            date_str = str(raw_date).strip()
            m, d = date_str.split(".")
            m = int(m)
            d = int(d)
        
        m_int = m
        m = str(m).zfill(2)
        d = str(d).zfill(2)
        
        if 1 <= m_int <= 4:
            year = start_year + 1
        else:
            year = start_year
        
        return f"{year}-{m}-{d}"
    except Exception as e:
        print(f"날짜 변환 오류: {raw_date}, {e}")
        return f"{start_year}-01-01"

# 날짜 변환 적용
df["fixed_date"] = df.apply(fix_date, axis=1)

# 관중수 숫자만 추출
df["관중수"] = df["관중수"].astype(str).replace("[^0-9]", "", regex=True).astype(int)

# 2025-2026 시즌 데이터 필터링
season_2025_2026 = df[df["시즌"] == "2025-2026"].copy()

# 라운드별 데이터 집계
round_data = defaultdict(lambda: {"attendance_sum": 0, "game_count": 0})

for idx, row in season_2025_2026.iterrows():
    round_val = row.get("라운드", None)
    if pd.notna(round_val):
        # 라운드 값 정규화 (예: "1" → "1라운드", "1라운드" → "1라운드")
        round_str = str(round_val).strip()
        # 숫자만 있는 경우 "라운드" 추가
        if round_str.isdigit():
            round_key = f"{round_str}라운드"
        elif "라운드" in round_str:
            round_key = round_str
        else:
            round_key = f"{round_str}라운드"
        
        round_data[round_key]["attendance_sum"] += row["관중수"]
        round_data[round_key]["game_count"] += 1

# 라운드별 평균 계산 및 정렬
round_avg_2025_2026 = {}
for round_key in sorted(round_data.keys(), key=lambda x: int(x.replace("라운드", "").strip())):
    data = round_data[round_key]
    if data["game_count"] > 0:
        round_avg_2025_2026[round_key] = {
            "avg_attendance": int(round(data["attendance_sum"] / data["game_count"])),
            "game_count": data["game_count"]
        }

print("2025-2026 시즌 라운드별 데이터:")
for round_key, data in round_avg_2025_2026.items():
    print(f"  {round_key}: 평균 {data['avg_attendance']}명 ({data['game_count']}경기)")

# season_trends.json 파일 읽기 및 업데이트
with open("season_trends.json", "r", encoding="utf-8") as f:
    season_trends = json.load(f)

# 2025-2026 시즌 라운드별 데이터 추가
season_trends["round_avg_2025_2026"] = round_avg_2025_2026

# 파일 저장
with open("season_trends.json", "w", encoding="utf-8") as f:
    json.dump(season_trends, f, ensure_ascii=False, indent=2)

print(f"\n✅ season_trends.json 파일에 2025-2026 시즌 라운드별 데이터 추가 완료 ({len(round_avg_2025_2026)}개 라운드)")

