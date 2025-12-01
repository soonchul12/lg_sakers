"""
경기별 팀 순위 데이터를 엑셀에서 읽어서 JSON으로 변환하는 스크립트

엑셀 파일 형식:
- 컬럼: 날짜, 순위
- 날짜 형식: YYYY-MM-DD 또는 엑셀 날짜 형식
- 순위: 숫자 (1~10)
"""

import pandas as pd
import json
from datetime import datetime

# 엑셀 파일 읽기 (파일명을 실제 파일명으로 변경하세요)
excel_file = "lg_game_rank.xlsx"  # 실제 엑셀 파일명으로 변경

try:
    df = pd.read_excel(excel_file)
    
    # 컬럼명 확인 및 정리
    print("엑셀 파일 컬럼:", df.columns.tolist())
    
    # 날짜 컬럼 찾기
    date_col = None
    rank_col = None
    
    for col in df.columns:
        col_lower = str(col).lower()
        if '날짜' in col_lower or 'date' in col_lower:
            date_col = col
        if '순위' in col_lower or 'rank' in col_lower or '위' in col_lower:
            rank_col = col
    
    if date_col is None or rank_col is None:
        print("오류: 날짜 또는 순위 컬럼을 찾을 수 없습니다.")
        print("필요한 컬럼: '날짜', '순위'")
        exit(1)
    
    # 날짜 변환
    df[date_col] = pd.to_datetime(df[date_col])
    df['날짜'] = df[date_col].dt.strftime('%Y-%m-%d')
    
    # 순위 데이터 정리
    df['순위'] = pd.to_numeric(df[rank_col], errors='coerce')
    
    # 경기별 순위 데이터 생성
    game_rank = []
    for _, row in df.iterrows():
        if pd.notna(row['날짜']) and pd.notna(row['순위']):
            game_rank.append({
                '날짜': row['날짜'],
                '순위': int(row['순위'])
            })
    
    # 날짜순으로 정렬
    game_rank.sort(key=lambda x: x['날짜'])
    
    # JSON 구조 생성
    output = {
        'game_rank': game_rank
    }
    
    # JSON 파일 생성
    with open('lg_game_rank.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ lg_game_rank.json 파일이 성공적으로 생성되었습니다!")
    print(f"   - 총 {len(game_rank)}개 경기의 순위 데이터")
    print(f"\n샘플 데이터:")
    for game in game_rank[:5]:
        print(f"   {game['날짜']}: {game['순위']}위")
    
except FileNotFoundError:
    print(f"❌ 오류: '{excel_file}' 파일을 찾을 수 없습니다.")
    print("\n엑셀 파일 준비 방법:")
    print("1. 엑셀 파일을 'lg_game_rank.xlsx'로 저장")
    print("2. 첫 번째 컬럼: 날짜 (예: 2024-10-19 또는 엑셀 날짜 형식)")
    print("3. 두 번째 컬럼: 순위 (예: 2)")
    print("\n예시:")
    print("날짜        | 순위")
    print("2024-10-19  | 3")
    print("2024-10-21  | 2")
    print("2024-10-24  | 2")
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()

