import pandas as pd
import json
from datetime import datetime

df = pd.read_excel("lg_crowd.xlsx")

# all.xlsx에서 상대팀 정보 가져오기
try:
    all_df = pd.read_excel("all.xlsx")
    print("✅ all.xlsx 파일을 읽었습니다. 상대팀 정보를 매칭합니다...")
except FileNotFoundError:
    all_df = None
    print("⚠️  all.xlsx 파일을 찾을 수 없습니다. 상대팀 정보 없이 진행합니다.")

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

# 날짜를 datetime으로 변환하여 요일 계산
df["date_obj"] = pd.to_datetime(df["fixed_date"])
df["요일"] = df["date_obj"].dt.dayofweek  # 0=월요일, 6=일요일
df["is_weekend"] = df["요일"].isin([5, 6])  # 토요일(5), 일요일(6)

# 시즌별 평균 관중수 계산
season_avg = df.groupby("시즌")["관중수"].mean().round(0).astype(int).to_dict()

# 시즌별 주말/주중 평균 관중수 계산
season_weekend_avg = {}
season_weekday_avg = {}

for season in df["시즌"].unique():
    season_data = df[df["시즌"] == season]
    
    # 주말 평균 (토요일, 일요일)
    weekend_data = season_data[season_data["is_weekend"] == True]
    if len(weekend_data) > 0:
        season_weekend_avg[season] = int(weekend_data["관중수"].mean().round(0))
    else:
        season_weekend_avg[season] = 0
    
    # 주중 평균 (월요일~금요일)
    weekday_data = season_data[season_data["is_weekend"] == False]
    if len(weekday_data) > 0:
        season_weekday_avg[season] = int(weekday_data["관중수"].mean().round(0))
    else:
        season_weekday_avg[season] = 0

# 날짜 정규화 함수
def normalize_date_for_match(date_val):
    """매칭을 위한 날짜 정규화"""
    if pd.isna(date_val):
        return None
    try:
        if isinstance(date_val, float):
            date_str = f"{date_val:.2f}"
            parts = date_str.split(".")
            m = int(parts[0])
            d = round(float("0." + parts[1]) * 100)
        else:
            date_str = str(date_val).strip()
            m, d = date_str.split(".")
            m = int(m)
            d = int(d)
        return f"{m:02d}.{d:02d}"
    except:
        return None

# 팀명 정규화 함수
def normalize_team_name(team_name):
    """팀명을 표준 형식으로 정규화"""
    team_name_mapping = {
        '서울SK': '서울 SK',
        '서울 SK': '서울 SK',
        '서울삼성': '서울 삼성',
        '서울 삼성': '서울 삼성',
        '원주DB': '원주 DB',
        '원주 DB': '원주 DB',
        '원주동부': '원주 DB',
        '부산KCC': '부산 KCC',
        '부산 KCC': '부산 KCC',
        '전주KCC': '부산 KCC',
        '전주 KCC': '부산 KCC',
        '안양KGC': '안양 KGC',
        '안양 KGC': '안양 KGC',
        '안양 정관장': '안양 KGC',
        '수원KT': '수원 KT',
        '수원 KT': '수원 KT',
        '부산KT': '수원 KT',
        '울산현대모비스': '울산 현대모비스',
        '울산 현대모비스': '울산 현대모비스',
        '울산모비스': '울산 현대모비스',
        '대구 한국가스공사': '대구 한국가스공사',
        '고양오리온': '고양 오리온',
        '고양 오리온': '고양 오리온',
        '고양오리온스': '고양 오리온',
        '고양 소노': '고양 Sono',
        '고양 Sono': '고양 Sono',
        '고양 캐롯': '고양 Sono',
        '인천전자랜드': '인천 전자랜드',
        '인천 전자랜드': '인천 전자랜드'
    }
    return team_name_mapping.get(team_name, team_name)

# 상대팀 정보 매칭 (개선된 버전)
def find_opponent(row):
    """all.xlsx에서 같은 시즌의 다른 팀을 찾아 상대팀으로 반환
    우선순위: 1) 경기번호 + 날짜, 2) 경기번호만, 3) 날짜만
    """
    if all_df is None:
        return None
    
    season = str(row["시즌"])
    game_num = row["경기 번호"]
    date_val = row["날짜"]
    normalized_date = normalize_date_for_match(date_val)
    round_info = row.get("라운드", None)
    
    # 같은 시즌의 다른 팀 찾기 (LG가 아닌 팀)
    opponent_games = all_df[
        (all_df['시즌'] == season) & 
        (~all_df['팀 관중현황'].str.contains('LG|창원', na=False, regex=True))
    ].copy()
    
    if len(opponent_games) == 0:
        return None
    
    # 날짜 정규화
    opponent_games['normalized_date'] = opponent_games['날짜'].apply(normalize_date_for_match)
    
    # 방법 1: 경기 번호 + 날짜로 매칭 (가장 정확)
    if normalized_date is not None:
        same_game_and_date = opponent_games[
            (opponent_games['경기 번호'] == game_num) &
            (opponent_games['normalized_date'] == normalized_date)
        ]
        if len(same_game_and_date) > 0:
            opponent = same_game_and_date.iloc[0]['팀 관중현황']
            return normalize_team_name(opponent)
    
    # 방법 2: 경기 번호만으로 매칭 (같은 경기 번호는 같은 경기)
    same_game_num = opponent_games[opponent_games['경기 번호'] == game_num]
    if len(same_game_num) > 0:
        # 라운드 정보가 있으면 라운드도 고려
        if round_info and '라운드' in same_game_num.columns:
            same_round = same_game_num[same_game_num['라운드'] == round_info]
            if len(same_round) > 0:
                opponent = same_round.iloc[0]['팀 관중현황']
                return normalize_team_name(opponent)
        # 라운드 정보가 없거나 매칭 안 되면 첫 번째 사용
        opponent = same_game_num.iloc[0]['팀 관중현황']
        return normalize_team_name(opponent)
    
    # 방법 3: 날짜 + 라운드로 매칭
    if normalized_date is not None and round_info:
        same_date_round = opponent_games[
            (opponent_games['normalized_date'] == normalized_date) &
            (opponent_games['라운드'] == round_info)
        ]
        if len(same_date_round) > 0:
            opponent = same_date_round.iloc[0]['팀 관중현황']
            return normalize_team_name(opponent)
    
    # 방법 4: 날짜만으로 매칭 (fallback)
    if normalized_date is not None:
        same_date_teams = opponent_games[opponent_games['normalized_date'] == normalized_date]
        if len(same_date_teams) > 0:
            # 경기 번호가 가장 가까운 팀 선택
            same_date_teams['game_num_diff'] = abs(same_date_teams['경기 번호'] - game_num)
            closest_team = same_date_teams.nsmallest(1, 'game_num_diff')
            opponent = closest_team.iloc[0]['팀 관중현황']
            return normalize_team_name(opponent)
    
    # 방법 5: 라운드만으로 매칭 (같은 라운드의 다른 팀)
    if round_info:
        same_round_teams = opponent_games[opponent_games['라운드'] == round_info]
        if len(same_round_teams) > 0:
            # 날짜가 가장 가까운 팀 선택
            if normalized_date is not None:
                same_round_teams['date_diff'] = same_round_teams['normalized_date'].apply(
                    lambda x: abs(int(x.split('.')[0]) * 100 + int(x.split('.')[1]) - 
                                 (int(normalized_date.split('.')[0]) * 100 + int(normalized_date.split('.')[1]))) 
                    if x and x != normalized_date else 999
                )
                closest_team = same_round_teams.nsmallest(1, 'date_diff')
                if len(closest_team) > 0 and closest_team.iloc[0]['date_diff'] < 10:  # 10일 이내
                    opponent = closest_team.iloc[0]['팀 관중현황']
                    return normalize_team_name(opponent)
    
    return None

# 상대팀 정보 추가
if all_df is not None:
    df["상대팀"] = df.apply(find_opponent, axis=1)
    matched_count = df["상대팀"].notna().sum()
    total_count = len(df)
    print(f"✅ 상대팀 매칭 완료: {matched_count}/{total_count} 경기 ({matched_count/total_count*100:.1f}%)")
else:
    df["상대팀"] = None

# 경기별 데이터 정렬
df = df.sort_values("fixed_date")
# 요일 정보 포함하여 경기별 데이터 생성
game_by_game_columns = ["fixed_date", "관중수", "is_weekend"]
if "상대팀" in df.columns and df["상대팀"].notna().any():
    game_by_game_columns.append("상대팀")

game_by_game = df[game_by_game_columns].rename(columns={"fixed_date": "날짜"}).to_dict(orient="records")

# JSON 구조 생성
output = {
    "season_avg": season_avg,
    "season_weekend_avg": season_weekend_avg,
    "season_weekday_avg": season_weekday_avg,
    "game_by_game": game_by_game
}

# JSON 파일 생성
with open("lg_crowd_clean.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("DONE → lg_crowd_clean.json 정상 생성됨")
