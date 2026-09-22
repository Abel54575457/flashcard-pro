/**
 * LINE Messaging API 課後推播 Google Apps Script (GAS) 代理程式 — 2026 極速版
 * 
 * 功能特點：
 * 1. 【Token 驗證】支援 action=check，一秒檢測 Token 與 LINE Bot 是否連線正常
 * 2. 【全班極速推播】支援 action=batch，全班推播在 Google 雲端 2 秒內完成，絕不卡死瀏覽器
 * 3. 【個別推播】支援 action=push，單一學生推播
 * 4. 【高相容性】自動處理 GET 與 POST，原生支援 CORS
 */

// ⭐ 備用 LINE Channel Access Token
var DEFAULT_TOKEN = 'tA+pW5dxTSDYkmCZou7kTt1APVC9U4H2xm9J6Pny8fCE/2dFhL2qdizLym7dT0jOdOzPRGBE/lJjRhtN5eIpjD0djQ7fR49VG642tLTSpypbrznk3szasMVguJiaFSiqfwhW7/tG4ucsxWi4F6cE1gdB04t89/1O/w1cDnyilFU=';

function doGet(e) {
  return handleRequest(e ? e.parameter : {});
}

function doPost(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      for (var k in body) { params[k] = body[k]; }
    } catch(err) {}
  }
  return handleRequest(params);
}

function handleRequest(params) {
  params = params || {};
  var callback = params.callback || '';
  var action   = params.action || (params.check ? 'check' : (params.data ? 'batch' : 'push'));
  var token    = (params.tk && params.tk.length > 20) ? params.tk.trim() : DEFAULT_TOKEN;
  var liff     = params.liff || 'https://liff.line.me/2011565097-n1Ab1IlP';
  var liffUrl  = (liff.indexOf('http') === 0) ? liff : ('https://liff.line.me/' + liff);

  // 1. 連線檢測模式 (驗證 Token 與 Bot 狀態)
  if (action === 'check') {
    try {
      var resp = UrlFetchApp.fetch('https://api.line.me/v2/bot/info', {
        headers: { 'Authorization': 'Bearer ' + token },
        muteHttpExceptions: true
      });
      var code = resp.getResponseCode();
      var text = resp.getContentText();
      if (code === 200) {
        var info = JSON.parse(text);
        return jsonResponse({
          success: true,
          status: 200,
          botName: info.displayName || 'LINE 官方帳號',
          botId: info.basicId || ''
        }, callback);
      } else {
        return jsonResponse({
          success: false,
          status: code,
          error: (code === 401 ? 'LINE Token 已失效 (401 認證失敗)，請至 LINE Developers 重新發行' : text)
        }, callback);
      }
    } catch(err) {
      return jsonResponse({ success: false, error: 'GAS 呼叫 LINE 例外: ' + err.toString() }, callback);
    }
  }

  // 2. 全班批次推播模式 (action=batch)
  if (action === 'batch') {
    var rawData = params.data || params.students || '[]';
    var students = [];
    try {
      students = (typeof rawData === 'string') ? JSON.parse(rawData) : rawData;
    } catch(e) {
      return jsonResponse({ success: false, error: '批次資料解析失敗: ' + e.toString() }, callback);
    }

    var sentCount = 0;
    var failCount = 0;
    var errors = [];

    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      var to = s.to || s.t || '';
      if (!to) continue;
      var name = decodeURIComponent(s.name || s.n || '同學');
      var seat = s.seat || s.s || '';
      var due = parseInt(s.due || s.d || '0');
      var streak = parseInt(s.streak || s.k || '1');

      var pushRes = doPushOne(token, to, name, seat, due, streak, liffUrl);
      if (pushRes.success) {
        sentCount++;
      } else {
        failCount++;
        if (errors.length < 3) errors.push('座號 ' + seat + ': ' + pushRes.error);
      }
    }

    return jsonResponse({
      success: sentCount > 0,
      sentCount: sentCount,
      failCount: failCount,
      total: students.length,
      errors: errors
    }, callback);
  }

  // 3. 單人推播模式 (action=push)
  var to = params.to || '';
  if (!to) {
    return jsonResponse({ success: false, error: '缺少 to 參數 (學生 LINE User ID)' }, callback);
  }
  var name = decodeURIComponent(params.name || '同學');
  var seat = params.seat || '';
  var due = parseInt(params.due || '0');
  var streak = parseInt(params.streak || '1');

  var singleRes = doPushOne(token, to, name, seat, due, streak, liffUrl);
  return jsonResponse(singleRes, callback);
}

function doPushOne(token, to, name, seat, due, streak, liffUrl) {
  var isDue = due > 0;
  var altText = isDue
    ? ('課後單字複習提醒：座號 ' + seat + ' 有 ' + due + ' 個單字待複習！')
    : ('課後學習提醒：觀光英文單字卡已上線！');
  var bodyText = isDue
    ? (name + ' 今日有 ' + due + ' 個單字進入記憶曲線複習池，黃金時間快來複習！')
    : (name + ' 保持每日學習好習慣！觀光餐旅單字新關卡已準備就緒，點擊開始挑戰！');

  var messages = [{
    type: 'flex',
    altText: altText,
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#06C755',
        contents: [
          { type: 'text', text: '📢 課後單字學習提醒', weight: 'bold', color: '#FFFFFF', size: 'xs' },
          { type: 'text', text: name + ' (座號 ' + seat + ')', weight: 'bold', color: '#FFFFFF', size: 'xl', margin: 'sm' }
        ]
      },
      body: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: bodyText, wrap: true, size: 'sm', color: '#333333' },
          { type: 'text', text: '🔥 連續學習天數：' + streak + ' 天', size: 'xs', color: '#888888', margin: 'md' }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [{
          type: 'button',
          action: { type: 'uri', label: '🚀 開始背單字 / 挑戰關卡', uri: liffUrl },
          style: 'primary', color: '#06C755'
        }]
      }
    }
  }];

  try {
    var response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      payload: JSON.stringify({ to: to, messages: messages }),
      muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    var text = response.getContentText();
    return {
      success: (code === 200),
      status: code,
      error: (code !== 200) ? ('LINE ' + code + ': ' + text) : ''
    };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

function jsonResponse(obj, callback) {
  var jsonStr = JSON.stringify(obj);
  if (callback && callback.length > 0) {
    return ContentService.createTextOutput(callback + '(' + jsonStr + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}
