/********************************************
 * 1) DOPOST — Receives form data
 ********************************************/
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Headers from sheet
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Convert DOB
    var dobFormatted = formatDOB(e.parameter.dob);

    var formData = {
      Name: e.parameter.name || "",
      Email: e.parameter.email || "",
      DOB: dobFormatted,
      Relation: e.parameter.relation || "",
      Message: e.parameter.message || "",
      Timestamp: new Date(),
    };

    // Insert into sheet
    var newRow = [];
    headers.forEach(function(h) {
      newRow.push(formData[h] || "");
    });
    sheet.appendRow(newRow);

    // Birthday check
    if (isBirthdayToday(dobFormatted)) {
      sendInstantBirthdayEmail(
        formData.Name,
        formData.Email,
        formData.Message,
        formData.Relation
      );
    }

    return ContentService.createTextOutput("SUCCESS");

  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err);
  }
}


/********************************************
 * 2) DOB format
 ********************************************/
function formatDOB(dobValue) {
  if (!dobValue) return "";
  var date = new Date(dobValue);
  if (isNaN(date.getTime())) return dobValue;

  var d = ("0" + date.getDate()).slice(-2);
  var m = ("0" + (date.getMonth() + 1)).slice(-2);
  var y = date.getFullYear();
  return d + "-" + m + "-" + y;
}


/********************************************
 * 3) Check date == today
 ********************************************/
function isBirthdayToday(dobText) {
  if (!dobText) return false;
  var parts = dobText.split("-");
  if (parts.length !== 3) return false;

  var day = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);

  var today = new Date();
  return (today.getDate() === day && today.getMonth() + 1 === month);
}


/********************************************
 * 4) SEND EMAIL WITH EMOJI CODES + SURPRISE LINK
 ********************************************/
function sendInstantBirthdayEmail(name, email, message, relation) {
  if (!email.trim()) return;

  var webAppUrl = ScriptApp.getService().getUrl(); 
  var surpriseLink = webAppUrl + "?name=" + encodeURIComponent(name);

  var subject = "&#127874; Happy Birthday " + name + "! &#127881;";

  var htmlBody = `
  <div style="
      background-color:#0f172a;
      padding:40px;
      font-family:'Poppins',sans-serif;
      color:white;
      text-align:center;
      border-radius:22px;">
      
      <h1 style="font-size:32px; color:#ff86c8; margin-bottom:12px;">
          &#127874; Happy Birthday ${name}! &#127881;
      </h1>

      <p style="font-size:16px; color:#d1d5db; margin-bottom:25px;">
          Wishing you a day filled with love and happiness! &#128150;
      </p>

      <a href="${surpriseLink}"
         style="
            display:inline-block;
            background:linear-gradient(45deg,#ff4d6d,#ff77a9);
            padding:15px 30px;
            color:white;
            font-size:16px;
            border-radius:14px;
            text-decoration:none;
            font-weight:600;">
          &#127873; Open Your Birthday Surprise!
      </a>

      <p style="color:#94a3b8; margin-top:30px; font-size:14px;">
          ${message}
      </p>

      <p style="color:#e2e8f0; margin-top:20px; font-size:15px;">
          With love,<br>
          <b>${relation} &#128150;</b>
      </p>
  </div>
  `;

  GmailApp.sendEmail(email, subject, "HTML not supported.", {
    htmlBody: htmlBody,
  });
}


/********************************************
 * 5) WEB APP — SHOW Wishing PAGE
 ********************************************/
function doGet(e) {
  return HtmlService.createTemplateFromFile("music").evaluate().setTitle("Birthday Surprise");
}


/********************************************
 * 6) Include HTML
 ********************************************/
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
