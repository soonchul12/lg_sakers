import pandas as pd
import json

df = pd.read_excel("lg_crowd.xlsx")

# 시즌 시작 연도 구하기 (예: "2025-2026" → 2025)
def get_start_year(season_str):
    try:
        return int(season_str.split("-")[0])
    except:
        return 2025  # 혹시 오류 나면 기본값

# 날짜 변환: "10.03" → "2025-10-03"
def fix_date(row):
    raw_date = str(row["날짜"]).strip()
    season = str(row["시즌"])
    year = get_start_year(season)

    # 월, 일 나누기
    try:
        m, d = raw_date.split(".")
        m = m.zfill(2)
        d = d.zfill(2)
        return f"{year}-{m}-{d}"
    except:
        return f"{year}-01-01"  # 에러 발생 시 임시 날짜

# 날짜 변환 적용
df["fixed_date"] = df.apply(fix_date, axis=1)

# 관중수 숫자만 추출
df["관중수"] = df["관중수"].astype(str).replace("[^0-9]", "", regex=True).astype(int)

# 시즌별 평균 관중수 계산
season_avg = df.groupby("시즌")["관중수"].mean().round(0).astype(int).to_dict()

# 경기별 데이터 정렬
df = df.sort_values("fixed_date")
game_by_game = df[["fixed_date", "관중수"]].rename(columns={"fixed_date": "날짜"}).to_dict(orient="records")

# JSON 구조 생성
output = {
    "season_avg": season_avg,
    "game_by_game": game_by_game
}

# JSON 파일 생성
with open("lg_crowd_clean.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("DONE → lg_crowd_clean.json 정상 생성됨")
