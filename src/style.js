function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Select a cell(s) and click to update', functionName: 'populateNumber'}
  ];
  spreadsheet.addMenu('**UI Github Issues - Get Fresh Data**', menuItems);

 }

function getNumber(component, filters) {
  filters = filters || '';
  component = component || '';
  var query = ['is:issue', 'is:open', 'org:ampproject', 'label:"WG: ui-and-a11y"'];
  var labelsToAdd = [component].concat(filters.split(','));
  var query = query.concat(labelsToAdd.map( l => { return 'label:"' +  l.trim() + '"'; }));
  var url = 'https://api.github.com/search/issues?q=' + encodeURIComponent(query.join(' '));
  try {
    var response = UrlFetchApp.fetch(url);
    var w = JSON.parse(response.getContentText());
    var count = w['total_count'];
    return { "num": count, "link": url.replace('https://api.github.com', 'https://github.com') };
  } catch(e) {
    Utilities.sleep(10 * 1000);
    return getNumber(component, filters);
  }

function populateNumberByCell(sheet, cell) {
  var rowIndex = cell.getRow();
  var rowCol = cell.getColumn();
  var component = sheet.getRange(rowIndex, 1).getValue();
  var filters = sheet.getRange(1, rowCol).getValue();
  var info = getNumber(component, filters);
  cell.setValue('=HYPERLINK("' + info.link + '",' + info.num + ')');
}

function populateNumber() {
  var sheet = SpreadsheetApp.getActiveSheet();

  var range = sheet.getActiveRange();
  var numRows = range.getNumRows();
  var numCols = range.getNumColumns();

  for (var i = 0; i < numRows; i++) {
    for (var j = 0; j < numCols; j++) {
      var cell = range.getCell(i+1,j+1);
      populateNumberByCell(sheet, cell);
    }
  }
}
