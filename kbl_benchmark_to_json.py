"""
KBL 리그 벤치마킹 데이터를 엑셀에서 읽어서 JSON으로 변환하는 스크립트

엑셀 파일 형식 예시:
- 시트1: 시즌별 리그 평균 관중수
  컬럼: 시즌, 리그평균관중수
  
- 시트2: 구단별 관중수 랭킹 (2024-2025 시즌)
  컬럼: 구단명, 평균관중수, 순위
"""

import pandas as pd
import json

# 엑셀 파일 읽기 (파일명을 실제 파일명으로 변경하세요)
excel_file = "kbl_benchmark.xlsx"  # 실제 엑셀 파일명으로 변경

try:
    # 시즌별 리그 평균 관중수 읽기
    df_league = pd.read_excel(excel_file, sheet_name=0)  # 첫 번째 시트
    
    # 구단별 랭킹 읽기
    df_teams = pd.read_excel(excel_file, sheet_name=1)  # 두 번째 시트
    
    # 시즌별 리그 평균 데이터 변환
    league_avg = {}
    if "시즌" in df_league.columns and "리그평균관중수" in df_league.columns:
        for _, row in df_league.iterrows():
            season = str(row["시즌"]).strip()
            avg = int(row["리그평균관중수"])
            league_avg[season] = avg
    else:
        print("경고: 시즌별 리그 평균 데이터 컬럼을 찾을 수 없습니다.")
        print("사용 가능한 컬럼:", df_league.columns.tolist())
    
    # 구단별 랭킹 데이터 변환
    team_ranking = []
    if "구단명" in df_teams.columns and "평균관중수" in df_teams.columns:
        for idx, row in df_teams.iterrows():
            team_ranking.append({
                "team": str(row["구단명"]).strip(),
                "avg_attendance": int(row["평균관중수"]),
                "rank": idx + 1
            })
    else:
        print("경고: 구단별 랭킹 데이터 컬럼을 찾을 수 없습니다.")
        print("사용 가능한 컬럼:", df_teams.columns.tolist())
    
    # 상위 구단 전략 (수동으로 관리하거나 엑셀에 추가 가능)
    top_teams_strategies = [
        {
            "team": "서울 SK",
            "strategy": "대도시 위치 + 스타 플레이어 마케팅",
            "key_points": [
                "서울 강남 지역 접근성 우수",
                "김선형 등 스타 플레이어 중심 마케팅",
                "프리미엄 좌석 패키지 운영"
            ]
        },
        {
            "team": "부산 KCC",
            "strategy": "지역 연고 강화 + 가족 단위 마케팅",
            "key_points": [
                "부산 지역 팬 커뮤니티 활성화",
                "가족 단위 할인 티켓 패키지",
                "지역 기업 협업 프로모션"
            ]
        },
        {
            "team": "안양 KGC",
            "strategy": "SNS 마케팅 + 이벤트 중심",
            "key_points": [
                "인스타그램/유튜브 활발한 콘텐츠 운영",
                "경기 중 이벤트 다양화",
                "팬 참여형 이벤트 (사인회, 포토타임 등)"
            ]
        }
    ]
    
    # JSON 구조 생성
    output = {
        "league_avg_by_season": league_avg,
        "team_ranking_2024_2025": team_ranking,
        "top_teams_strategies": top_teams_strategies
    }
    
    # JSON 파일 생성
    with open("kbl_benchmark.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print("✅ kbl_benchmark.json 파일이 성공적으로 생성되었습니다!")
    print(f"   - 시즌별 리그 평균: {len(league_avg)}개 시즌")
    print(f"   - 구단별 랭킹: {len(team_ranking)}개 구단")
    
except FileNotFoundError:
    print(f"❌ 오류: '{excel_file}' 파일을 찾을 수 없습니다.")
    print("   엑셀 파일명을 확인하거나 스크립트의 excel_file 변수를 수정하세요.")
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    print("\n엑셀 파일 형식 확인:")
    print("1. 첫 번째 시트: 시즌별 리그 평균 관중수 (컬럼: 시즌, 리그평균관중수)")
    print("2. 두 번째 시트: 구단별 랭킹 (컬럼: 구단명, 평균관중수)")

