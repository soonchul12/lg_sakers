import requests
from bs4 import BeautifulSoup
import json

URL = "https://en.wikipedia.org/wiki/2024%E2%80%9325_KBL_season"
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

table = soup.find("table", {"class": "wikitable"})
rows = table.find_all("tr")

home_points = []
home_allowed = []
away_points = []
away_allowed = []

for row in rows[1:]:
    cols = row.find_all("td")
    if len(cols) < 10:
        continue

    # LG 세이커스 이름
    team_name = cols[1].get_text(strip=True)
    if team_name != "Changwon LG Sakers":
        continue

    # 홈 득점 / 실점
    home_for = float(cols[5].get_text(strip=True))
    home_against = float(cols[6].get_text(strip=True))

    # 원정 득점 / 실점
    away_for = float(cols[7].get_text(strip=True))
    away_against = float(cols[8].get_text(strip=True))

    home_points.append(home_for)
    home_allowed.append(home_against)
    away_points.append(away_for)
    away_allowed.append(away_against)

data = {
    "home_for": home_points,
    "home_against": home_allowed,
    "away_for": away_points,
    "away_against": away_allowed
}

with open("lg_home_away_points.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("lg_home_away_points.json 생성 완료!")
