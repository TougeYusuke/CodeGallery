from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep

import datetime
import json
import requests

def get_next_tuesday(start_date):
    days_until_tuesday = (1 - start_date.weekday()) % 7
    next_tuesday = start_date + datetime.timedelta(days=days_until_tuesday + 7)  # ２週間後の火曜日を計算
    return next_tuesday

def get_week_dates(start_date):
    next_tuesday = get_next_tuesday(start_date)
    week_dates = []
    for _ in range(7):
        week_dates.append(next_tuesday)
        next_tuesday += datetime.timedelta(days=1)
    return week_dates

def get_weekday_japanese(date):
    weekdays_japanese = ["月", "火", "水", "木", "金", "土", "日"]
    return weekdays_japanese[date.weekday()]

def discord_notify(url, message):
    """
    Discord send message.
    Args:
        url (str): discord webhook url.
        message (str): message.
    """
    if url:
        requests.post(url,
                      data={'content': message})

print('送り先サーバーのURLを入力して選択してください。')
surver_url = input()

add_test = '\n<@&1105135968723415111>'

# ChromeDriverの自動検出
driver = webdriver.Chrome()

#指定したURLに遷移
driver.get("https://chouseisan.com/")

# 現在の日付を取得
today = datetime.date.today()
# 火曜日から始まる1週間の日付を取得
dates = get_week_dates(today)

# 現在の日付を取得
today = datetime.date.today()
# 開始日を取得
year_start = datetime.date(today.year, 5, 30)
# 今日が年の何週目かを計算
week_number = (dates[0] - year_start).days // 7 + 1
# テキストを設定
text_to_set = "第{}週目".format(week_number)

# テキストを設定
input_element = driver.find_element(by=By.XPATH, value='//*[@id="name"]')
input_element.send_keys(text_to_set)

# メモ(締め切り日時の設定)
text_to_set = "{}({})までに記入お願いします。".format(dates[3].strftime("%m/%d"),get_weekday_japanese(dates[3]))
input_element = driver.find_element(by=By.XPATH, value='//*[@id="comment"]')
input_element.send_keys(text_to_set)

# 候補日の設定
input_element_Schedule = driver.find_element(by=By.XPATH, value='//*[@id="kouho"]')
for date in dates:
    
    # 曜日を取得
    weekday = get_weekday_japanese(date)
   
    schedule_text = "{}({}) 22:30〜\n".format(date.strftime("%m/%d"),weekday)
    input_element_Schedule.send_keys(schedule_text)

# ボタンを探すために適切な待機を設定（この例では10秒まで待機する設定）
wait = WebDriverWait(driver, 10)
# ボタンを見つけてクリックする
try:
    # id属性が"createBtn"のボタンを待機して取得し、クリック
    button = wait.until(EC.element_to_be_clickable((By.ID, "createBtn")))
    button.click()
except Exception as e:
    print("ボタンが見つからなかったか、クリックできませんでした。エラー: ", e)

sleep(3)

# id属性が"listUrl"の<input>要素を取得
input_element = driver.find_element(by=By.XPATH, value='//*[@id="listUrl"]')
# テキストを取得
text_value = input_element.get_attribute("value")
# 結果を表示
print("取得したテキスト:", text_value)

DISCORD_URL = surver_url
discord_notify(DISCORD_URL, text_value + add_test)

#ドライバーを閉じる
driver.quit()

"""
改良案

◯ 設定を別ファイル化
・URL
・テキスト
　→ メモ
　→ 
・時間
・開始曜日
・何週間後か

"""

