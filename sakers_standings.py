# collect_lg_sakers_standings.py
#
# LG 세이커스 2024-25 시즌 순위/성적 데이터를 위키에서 가져와
# JSON 파일로 저장하는 스크립트.

import requests
from bs4 import BeautifulSoup
import json

# 2024-25 시즌 KBL 순위가 정리되어 있는 위키 (스페인어판)
WIKI_URL = "https://es.wikipedia.org/wiki/Liga_de_baloncesto_de_Corea_2024-25"


def fetch_lg_sakers_row():
    """
    위키피디아의 'Clasificación' 테이블에서
    LG 세이커스(Changwon LG Sakers) 행만 추출한다.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    res = requests.get(WIKI_URL, headers=headers, timeout=10)
    res.raise_for_status()

    soup = BeautifulSoup(res.text, "lxml")
    lg_data = None

    # 'Clasificación' 제목을 찾고, 그 아래 테이블을 읽음
    for heading in soup.find_all(["h2", "h3"]):
        if heading.get_text(strip=True).startswith("Clasificación"):
            table = heading.find_next("table")
            if not table:
                break

            # 첫 줄은 헤더라 제외
            for tr in table.find_all("tr")[1:]:
                cells = tr.find_all(["th", "td"])
                if len(cells) < 9:
                    continue

                team_name = cells[1].get_text(" ", strip=True)
                if "Changwon LG Sakers" in team_name:
                    # 소수점에 쉼표가 들어가 있어서 변환
                    win_pct = cells[5].get_text(strip=True).replace(",", ".")

                    lg_data = {
                        "season": "2024-25",
                        "position": int(cells[0].get_text(strip=True)),
                        "team": team_name,
                        "games": int(cells[2].get_text(strip=True)),
                        "wins": int(cells[3].get_text(strip=True)),
                        "losses": int(cells[4].get_text(strip=True)),
                        "win_pct": float(win_pct),
                        "points_for": int(cells[6].get_text(strip=True)),
                        "points_against": int(cells[7].get_text(strip=True)),
                        "point_diff": int(cells[8].get_text(strip=True)),
                        "source": WIKI_URL
                    }
                    break
            break

    if lg_data is None:
        raise RuntimeError("LG 세이커스 데이터를 찾지 못했습니다.")

    return lg_data


def main():
    print("LG 세이커스 2024-25 순위 데이터 가져오는 중...")
    data = fetch_lg_sakers_row()

    print("\n[LG Sakers 2024-25 시즌 데이터]")
    for k, v in data.items():
        print(f"{k}: {v}")

    # JSON 저장
    out_path = "lg_sakers_standings_2024_25.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nJSON 저장 완료 → {out_path}")
    print("index.html에서 fetch()로 불러와서 Chart.js 그래프로 연결하세요.")


if __name__ == "__main__":
    main()