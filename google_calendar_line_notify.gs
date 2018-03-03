// https://developers.google.com/apps-script/reference/calendar/
// https://developers.google.com/apps-script/reference/calendar/calendar-event
// https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
// https://developers.google.com/apps-script/reference/url-fetch/http-response

var googleCalendarId = "";
var lineNotifyEndPoint = "https://notify-api.line.me/api/notify";
var accessToken = "";
var monthlyPostEventTitleInitials = "��";// �������e�p�C�x���g����p������
var dayOfWeekStringList = ["��", "��", "��", "��", "��", "��", "�y"];

// �����p�̃��b�Z�[�W�i���e���o���j
function postDailyMessage() {
  var calendar = CalendarApp.getCalendarById(googleCalendarId); //�J�����_�[ID����J�����_�[���擾
  if (calendar === null)
  {
    Logger.log("�J�����_�[��������܂���ł����B");
    return;
  }
  
  var dailyEventList = calendar.getEventsForDay(new Date());// �{���̃C�x���g
  
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

// �����p�̃��b�Z�[�W
function postMonthlyMessage() {
  var nowDate = new Date();

  var year = nowDate.getYear();
  var month = nowDate.getMonth();

  var startDate = new Date(year, month, 1);// ����
  var endDate = new Date(year, month + 1, 0);// ����

  var calendar = CalendarApp.getCalendarById(googleCalendarId); //�J�����_�[ID����J�����_�[���擾
  if (calendar === null)
  {
    Logger.log("�J�����_�[��������܂���ł����B");
    return;
  }

  var monthlyEventList = calendar.getEvents(startDate, endDate);// getEvents��startDate���܂�endDate�͊܂܂Ȃ��l�q

  var message = "�����̗\��\n";
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
    eventMessage += eventTite + "�F" + (eventDate.getMonth() + 1)  + "/" + eventDate.getDate() + "�i" + dayOfWeekStringList[eventDate.getDay()] + "�j\n";
  }
  
  message += eventMessage ? eventMessage : "�o�^����Ă��܂���";

  sendMessage(message);
}

// ���b�Z�[�W���M
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
    Logger.log(error.name + "�F" + error.message);
    return;
  }
    
  if (response.getResponseCode() !== 200)
  {
    Logger.log("���b�Z�[�W�̑��M�Ɏ��s���܂����B");
  } 
}
