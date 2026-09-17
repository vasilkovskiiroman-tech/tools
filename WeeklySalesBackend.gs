/**
 * Бэкенд для формы weekly-report.html
 *
 * ВАЖНО: вставьте этот код через саму таблицу "Метро регулярная таблица"
 * (Google Sheets -> Расширения -> Apps Script), а не отдельным проектом.
 *
 * Структура таблицы (лист "Лист1"):
 *   Строка 3: заголовки магазинов (15, 16, 20)
 *   Строка 4: подзаголовки (сток, продажи недели, заказ текущий, потребность)
 *   Строки 5-32: 28 товарных позиций
 *   Столбец A: Art MGB, Столбец B: Art Subsys (артикул магазина), Столбец C: наименование
 *
 * Колонки по магазинам:
 *   Магазин 15: продажи недели = E, заказ текущий = F
 *   Магазин 16: продажи недели = I, заказ текущий = J
 *   Магазин 20: продажи недели = M, заказ текущий = N
 *
 * ШАГ: Развернуть -> Новое развертывание -> Веб-приложение.
 * Выполнять от имени: Я. Доступ: Все.
 */

const SHEET_NAME = "Лист1";
const ARTICLE_COL = 2;   // B - Art Subsys
const FIRST_DATA_ROW = 5;
const LAST_DATA_ROW = 32;

// Колонки "продажи недели" и "заказ текущий" для каждого магазина
const STORE_COLUMNS = {
  "15": { sales: 5, order: 6 },    // E, F
  "16": { sales: 9, order: 10 },   // I, J
  "20": { sales: 13, order: 14 }   // M, N
};

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput("Лист " + SHEET_NAME + " не найден");
  }

  const data = JSON.parse(e.postData.contents);
  const cols = STORE_COLUMNS[String(data.store)];
  if (!cols) {
    return ContentService.createTextOutput("Неизвестный магазин: " + data.store);
  }

  const articles = sheet.getRange(FIRST_DATA_ROW, ARTICLE_COL, LAST_DATA_ROW - FIRST_DATA_ROW + 1, 1).getValues();

  const notFound = [];

  data.items.forEach(item => {
    let rowIndex = -1;
    for (let i = 0; i < articles.length; i++) {
      if (String(articles[i][0]).trim() === String(item.article).trim()) {
        rowIndex = i + FIRST_DATA_ROW;
        break;
      }
    }
    if (rowIndex === -1) { notFound.push(item.article); return; }

    sheet.getRange(rowIndex, cols.sales).setValue(item.sales);
    sheet.getRange(rowIndex, cols.order).setValue(item.order);
  });

  let msg = "OK";
  if (notFound.length) msg += ", не найдены артикулы: " + notFound.join(", ");
  return ContentService.createTextOutput(msg);
}
