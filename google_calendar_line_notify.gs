// https://developers.google.com/apps-script/reference/calendar/
// https://developers.google.com/apps-script/reference/calendar/calendar-event
// https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
// https://developers.google.com/apps-script/reference/url-fetch/http-response

var googleCalendarId = "";
var lineNotifyEndPoint = "https://notify-api.line.me/api/notify";
var accessToken = "";
var monthlyPostEventTitleInitials = "★";// 月初投稿用イベント判定用頭文字
var dayOfWeekStringList = ["日", "月", "火", "水", "木", "金", "土"];

// 毎日用のメッセージ（内容も出す）
function postDailyMessage() {
  var calendar = CalendarApp.getCalendarById(googleCalendarId); //カレンダーIDからカレンダーを取得
  if (calendar === null)
  {
    Logger.log("カレンダーが見つかりませんでした。");
    return;
  }
  
  var dailyEventList = calendar.getEventsForDay(new Date());// 本日のイベント
  
  var message = "";

  for each (var event in dailyEventList)
  {
    var eventTite = event.getTitle().replace(new RegExp(monthlyPostEventTitleInitials), "");
    var eventDescription = event.getDescription();
    message += eventTite + "\n" + eventDescription + "\n";
  }
  
  if (message === "")
  {
    return;
  }
  
  sendMessage(message);
}

// 月初用のメッセージ
function postMonthlyMessage() {
  var nowDate = new Date();

  var year = nowDate.getYear();
  var month = nowDate.getMonth();

  var startDate = new Date(year, month, 1);// 月初
  var endDate = new Date(year, month + 1, 0);// 月末

  var calendar = CalendarApp.getCalendarById(googleCalendarId); //カレンダーIDからカレンダーを取得
  if (calendar === null)
  {
    Logger.log("カレンダーが見つかりませんでした。");
    return;
  }

  var monthlyEventList = calendar.getEvents(startDate, endDate);// getEventsはstartDateを含みendDateは含まない様子

  var message = "今月の予定\n";
  var eventMessage = "";

  for each (var event in monthlyEventList)
  {
    var eventTite = event.getTitle();
    if ( ! eventTite || eventTite.slice(0, 1) !== monthlyPostEventTitleInitials)
    {
      continue;
    }
    eventTite = eventTite.replace(new RegExp(monthlyPostEventTitleInitials), "");
    var eventDate = event.getStartTime();// Date
    eventMessage += eventTite + "：" + (eventDate.getMonth() + 1)  + "/" + eventDate.getDate() + "（" + dayOfWeekStringList[eventDate.getDay()] + "）\n";
  }
  
  message += eventMessage ? eventMessage : "登録されていません";

  sendMessage(message);
}

// メッセージ送信
function sendMessage(message) {
  var formData = {
    "message": message
  };
  var options = {
    "headers" : {"Authorization" : "Bearer " + accessToken},
    "method" : 'post',
    "payload" : formData
  };

  try
  {
    var response = UrlFetchApp.fetch(lineNotifyEndPoint, options);
  }
  catch (error)
  {
    Logger.log(error.name + "：" + error.message);
    return;
  }
    
  if (response.getResponseCode() !== 200)
  {
    Logger.log("メッセージの送信に失敗しました。");
  } 
}
