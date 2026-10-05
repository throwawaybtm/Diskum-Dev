function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Awan Diskum - Portal Arsip')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function processUpload(formObject) {
  try {
    var rootFolder = getOrCreateFolder("Awan_Diskum_Arsip");
    var categoryFolder = getOrCreateSubFolder(rootFolder, formObject.kategori);
    
    var fileBlob = formObject.file;
    var savedFile = categoryFolder.createFile(fileBlob);
    var fileUrl = savedFile.getUrl();
    
    var sheet = getOrCreateDatabaseSheet();
    var timestamp = new Date();
    
    sheet.appendRow([
      timestamp, 
      formObject.nomor, 
      formObject.tanggal, 
      formObject.perihal, 
      formObject.kategori, 
      fileUrl
    ]);
    
    return { success: true, message: "Data berhasil disimpan!" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getArchiveData() {
  var sheet = getOrCreateDatabaseSheet();
  var data = sheet.getDataRange().getValues();
  if(data.length > 0) {
    data.shift(); 
  }
  return data;
}

// ---------------- Helper Functions ----------------

function getOrCreateDatabaseSheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('DATABASE_SHEET_ID');
  
  if (sheetId) {
    try {
      return SpreadsheetApp.openById(sheetId).getActiveSheet();
    } catch (e) {
      // If error (e.g. deleted), fall through and create a new one
    }
  }
  
  // Create new spreadsheet
  var ss = SpreadsheetApp.create("Buku Besar - Awan Diskum");
  var sheet = ss.getActiveSheet();
  
  // Set headers
  sheet.appendRow(["Waktu", "Nomor Surat", "Tanggal", "Perihal", "Kategori", "Link File"]);
  sheet.getRange("A1:F1").setFontWeight("bold");
  sheet.setFrozenRows(1);
  
  // Save ID
  props.setProperty('DATABASE_SHEET_ID', ss.getId());
  
  return sheet;
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

function getOrCreateSubFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}
