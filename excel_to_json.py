import pandas as pd
import json

df = pd.read_excel("lg_crowd.xlsx")

# 시즌 시작 연도 구하기 (예: "2025-2026" → 2025)
def get_start_year(season_str):
    try:
        return int(season_str.split("-")[0])
    except:
        return 2025  # 혹시 오류 나면 기본값

# 날짜 변환: "10.03" → "2025-10-03", "1.01" → "2025-01-01" (시즌 종료 연도)
# 시즌은 10월에 시작해서 다음 해 4월에 끝남 (예: 2024-2025 시즌 = 2024년 10월 ~ 2025년 4월)
def fix_date(row):
    raw_date = row["날짜"]
    season = str(row["시즌"])
    start_year = get_start_year(season)

    # 엑셀에서 float로 읽힌 경우 처리 (예: 12.2 → "12.20", 1.3 → "1.30")
    try:
        if isinstance(raw_date, float):
            # float를 문자열로 변환 (소수점 둘째 자리까지, 반올림)
            date_str = f"{raw_date:.2f}"
            # 정수 부분과 소수 부분 분리
            parts = date_str.split(".")
            m = int(parts[0])
            # 소수 부분을 일자로 변환 (0.29 → 29)
            decimal_part = float("0." + parts[1])
            d = round(decimal_part * 100)  # 반올림으로 정밀도 문제 해결
        else:
            # 문자열인 경우
            date_str = str(raw_date).strip()
            m, d = date_str.split(".")
            m = int(m)
            d = int(d)
        
        m_int = m
        m = str(m).zfill(2)
        d = str(d).zfill(2)
        
        # 1월~4월은 시즌 종료 연도(시작 연도 + 1), 10월~12월은 시즌 시작 연도
        if 1 <= m_int <= 4:
            year = start_year + 1  # 다음 해 (예: 2024-2025 시즌의 1월 = 2025년)
        else:
            year = start_year  # 같은 해 (예: 2024-2025 시즌의 10월 = 2024년)
        
        return f"{year}-{m}-{d}"
    except Exception as e:
        print(f"날짜 변환 오류: {raw_date}, {e}")
        return f"{start_year}-01-01"  # 에러 발생 시 임시 날짜

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
