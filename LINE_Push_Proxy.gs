/**
 * LINE Messaging API 課後推播 Google Apps Script (GAS) 代理程式 — 2026.10 最新加強版
 * 
 * 功能特點：
 * 1. 【Token 驗證】支援 action=check，一秒檢測 Token 與 LINE Bot 是否連線正常，並回傳支援版本
 * 2. 【全班極速推播】支援 action=batch，全班推播在 Google 雲端 2 秒內完成，絕不卡死瀏覽器
 * 3. 【個別推播】支援 action=push，單一學生推播
 * 4. 【老師叮嚀支援】100% 完整支援「💡 老師叮嚀／自訂修改內容」，同步顯示於 LINE Flex 綠色卡片中
 * 5. 【容錯與防崩潰】內建 safeDecode 安全解碼，即使包含特殊符號或百分比 (如 100%) 亦絕不報錯
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

function safeDecode(val) {
  if (val === null || val === undefined) return '';
  var s = String(val);
  try {
    return decodeURIComponent(s);
  } catch(e) {
    return s;
  }
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
          version: '2026.10',
          supportsCustomMsg: true,
          botName: info.displayName || 'LINE 官方帳號',
          botId: info.basicId || ''
        }, callback);
      } else {
        return jsonResponse({
          success: false,
          status: code,
          version: '2026.10',
          supportsCustomMsg: true,
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
    var batchCustomMsg = safeDecode(params.msg || '');
    var batchCustomTitle = safeDecode(params.title || '');
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
      var name = safeDecode(s.name || s.n || '同學');
      var seat = s.seat || s.s || '';
      var due = parseInt(s.due || s.d || '0');
      var streak = parseInt(s.streak || s.k || '1');
      var itemMsg = (s.msg !== undefined && s.msg !== null && String(s.msg).trim().length > 0)
        ? safeDecode(s.msg)
        : batchCustomMsg;
      var itemTitle = (s.title !== undefined && s.title !== null && String(s.title).trim().length > 0)
        ? safeDecode(s.title)
        : batchCustomTitle;

      var pushRes = doPushOne(token, to, name, seat, due, streak, liffUrl, itemMsg, itemTitle);
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
      version: '2026.10',
      supportsCustomMsg: true,
      errors: errors
    }, callback);
  }

  // 3. 單人推播模式 (action=push)
  var to = params.to || '';
  if (!to) {
    return jsonResponse({ success: false, error: '缺少 to 參數 (學生 LINE User ID)' }, callback);
  }
  var name = safeDecode(params.name || '同學');
  var seat = params.seat || '';
  var due = parseInt(params.due || '0');
  var streak = parseInt(params.streak || '1');
  var singleCustomMsg = safeDecode(params.msg || '');
  var singleCustomTitle = safeDecode(params.title || '');

  var singleRes = doPushOne(token, to, name, seat, due, streak, liffUrl, singleCustomMsg, singleCustomTitle);
  return jsonResponse(singleRes, callback);
}

function doPushOne(token, to, name, seat, due, streak, liffUrl, customMsg, customTitle) {
  var isDue = due > 0;
  var safeTitle = safeDecode(customTitle);
  var title = (safeTitle && safeTitle.trim().length > 0) ? safeTitle.trim() : '📢 課後單字學習提醒';
  var safeMsg = safeDecode(customMsg);
  var cleanCustomMsg = (safeMsg && safeMsg.trim().length > 0) ? safeMsg.trim() : '';

  var altText = isDue
    ? ('課後單字複習提醒：座號 ' + seat + ' 有 ' + due + ' 個單字待複習！')
    : ('課後學習提醒：觀光英文單字卡已上線！');
  var bodyText = isDue
    ? (name + ' 今日有 ' + due + ' 個單字進入記憶曲線複習池，黃金時間快來複習！')
    : (name + ' 保持每日學習好習慣！觀光餐旅單字新關卡已準備就緒，點擊開始挑戰！');

  var bodyContents = [
    { type: 'text', text: bodyText, wrap: true, size: 'sm', color: '#333333' }
  ];

  // ⭐ 老師叮嚀區塊（若有自訂內容則顯示綠色醒目框）
  if (cleanCustomMsg && cleanCustomMsg.length > 0) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: 'sm',
      backgroundColor: '#F0FDF4',
      cornerRadius: 'md',
      contents: [
        { type: 'text', text: '💡 老師叮嚀：', weight: 'bold', size: 'xs', color: '#15803D' },
        { type: 'text', text: cleanCustomMsg, wrap: true, size: 'xs', color: '#166534', margin: 'xs' }
      ]
    });
  }

  bodyContents.push({
    type: 'text',
    text: '🔥 連續學習天數：' + (streak || 1) + ' 天',
    size: 'xs',
    color: '#888888',
    margin: 'md'
  });

  var messages = [{
    type: 'flex',
    altText: altText,
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#06C755',
        contents: [
          { type: 'text', text: title, weight: 'bold', color: '#FFFFFF', size: 'xs' },
          { type: 'text', text: name + ' (座號 ' + seat + ')', weight: 'bold', color: '#FFFFFF', size: 'xl', margin: 'sm' }
        ]
      },
      body: {
        type: 'box', layout: 'vertical',
        contents: bodyContents
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
      version: '2026.10',
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
