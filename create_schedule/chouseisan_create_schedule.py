from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime, timedelta
from time import sleep

import datetime
import json
import requests
import config

# セクション名とキーを指定して設定情報を取得
apiurl = config.api_url
messagetext = config.message_text
startweek = config.start_week
targetweek = config.target_week
limitday = config.limit_day
starttime = config.start_time
memotext = config.memo_text


def get_next_tuesday(start_date):
    # 現在の曜日を取得 (0:月曜日, 1:火曜日, ..., 6:日曜日)
    current_day_of_week = start_date.weekday()
    # ２週間後の日付を計算
    two_weeks_later = start_date + timedelta(weeks=targetweek)
    # ２週間後の曜日を取得 (0:月曜日, 1:火曜日, ..., 6:日曜日)
    day_of_week_two_weeks_later = two_weeks_later.weekday()

    # 火曜日までの日数を計算
    days_until_next_tuesday = (1 - day_of_week_two_weeks_later + 7) % 7
    # ２週間後の火曜日の日付を計算
    next_tuesday_two_weeks_later = two_weeks_later + timedelta(days=days_until_next_tuesday)

    return next_tuesday_two_weeks_later

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
text_to_set = memotext.format(dates[limitday].strftime("%m/%d"),get_weekday_japanese(dates[limitday]))
input_element = driver.find_element(by=By.XPATH, value='//*[@id="comment"]')
input_element.send_keys(text_to_set)

# 候補日の設定
input_element_Schedule = driver.find_element(by=By.XPATH, value='//*[@id="kouho"]')
for date in dates:
    
    # 曜日を取得
    weekday = get_weekday_japanese(date)
   
    schedule_text_format = "{}({})" + starttime + "\n"
    schedule_text =  schedule_text_format.format(date.strftime("%m/%d"),weekday)
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

deltatime = 5
while deltatime <= 0:
    deltatime -= 0.1
    schedule = driver.find_elements_by_xpath('//*[@id="listUrl"]')
    if schedule >= 1:
        break
    sleep(0.1)

# id属性が"listUrl"の<input>要素を取得
input_element = driver.find_element(by=By.XPATH, value='//*[@id="listUrl"]')
# テキストを取得
text_value = input_element.get_attribute("value")

notice_text = text_value + messagetext
discord_notify(apiurl, notice_text)

#ドライバーを閉じる
driver.quit()


