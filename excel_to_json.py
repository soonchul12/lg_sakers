import pandas as pd

# ① 여기를 네가 다운로드한 엑셀 파일명으로 바꿔줘
excel_file = "팀 관중현황.xlsx"

# ② 엑셀 읽기
df = pd.read_excel(excel_file)

# ③ 숫자형 변환 + "명" 제거
def clean_crowd(x):
    if isinstance(x, str):
        return int(x.replace(",", "").replace("명", ""))
    return x

df["관중수"] = df["관중수"].apply(clean_crowd)

# ④ 필요한 컬럼만 선택
df = df[["날짜", "관중수"]]

# ⑤ JSON으로 저장
output_file = "lg_crowd.json"
df.to_json(output_file, orient="records", force_ascii=False)

print("JSON 변환 완료:", output_file)
