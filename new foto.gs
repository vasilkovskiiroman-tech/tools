// Отдельный скрипт для приёма фото ценников с телефона сотрудника.
// Не связан с ценовым скриптом (PriceCheckBackend.gs) — работает независимо.

// ID папки "Метро фотографии" на Google Диске.
// Взят из ссылки: https://drive.google.com/drive/folders/1wiQlDIkxlQXypGnJTajTpOeU2uJWakuO
var FOLDER_ID = "1wiQlDIkxlQXypGnJTajTpOeU2uJWakuO";

function doPost(e) {
  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var data = JSON.parse(e.postData.contents);

    var store = data.store || "без_номера";
    var item = data.item ? String(data.item).replace(/[\\/:*?"<>|]/g, "").substring(0, 40) : "";
    var timestamp = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd_HH-mm-ss");

    var saved = 0;
    (data.photos || []).forEach(function (photoBase64, i) {
      var raw = photoBase64.indexOf(",") !== -1 ? photoBase64.split(",")[1] : photoBase64;
      var bytes = Utilities.base64Decode(raw);
      var fileName = "Магазин_" + store + (item ? "_" + item : "") + "_" + timestamp + "_" + (i + 1) + ".jpg";
      var blob = Utilities.newBlob(bytes, "image/jpeg", fileName);
      folder.createFile(blob);
      saved++;
    });

    return ContentService.createTextOutput("OK: сохранено фото - " + saved);
  } catch (err) {
    return ContentService.createTextOutput("Ошибка: " + err.message);
  }
}

// doGet не нужен — используется только для проверки, что веб-приложение развёрнуто.
function doGet(e) {
  return ContentService.createTextOutput("Скрипт приёма фото работает. Отправка данных только через POST.");
}
