function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Awan Diskum - Portal Arsip')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function processUpload(formObject) {
  try {
    var kategori = formObject.kategori;
    var rootFolder = getOrCreateFolder("Awan_Diskum_Arsip");
    var categoryFolder = getOrCreateSubFolder(rootFolder, kategori);
    
    var fileUrl = "";
    // Jika tidak ada file yang diunggah (misal opsional), lewati
    if (formObject.file && formObject.file.length > 0) {
        var fileBlob = formObject.file;
        var savedFile = categoryFolder.createFile(fileBlob);
        fileUrl = savedFile.getUrl();
    }
    
    var sheet = getOrCreateDatabaseSheet(kategori);
    var timestamp = new Date();
    
    var rowData = [];
    if (kategori === "Surat Masuk") {
      rowData = [
        timestamp,
        formObject.tanggalTerima || "",
        formObject.asalSurat || "",
        formObject.tanggalSurat || "",
        formObject.nomorSurat || "",
        formObject.perihal || "",
        formObject.disposisiIsi || "",
        formObject.disposisiUnit || "",
        formObject.tandaTerima || "",
        formObject.keterangan || "",
        fileUrl
      ];
    } else {
      // Surat Keluar, Surat Tugas, Surat Khusus, Surat Keputusan
      rowData = [
        timestamp,
        formObject.asalSurat || "",
        formObject.tanggalSurat || "",
        formObject.nomorSurat || "",
        formObject.perihal || "",
        formObject.tujuanSurat || "",
        formObject.pengirim || "",
        formObject.penerima || "",
        formObject.keterangan || "",
        fileUrl
      ];
    }
    
    sheet.appendRow(rowData);
    
    return { success: true, message: "Data berhasil disimpan di " + kategori + "!" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getArchiveData() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('DATABASE_SHEET_ID');
  if (!sheetId) return [];

  try {
    var ss = SpreadsheetApp.openById(sheetId);
    var allData = [];
    var sheets = ss.getSheets();
    
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      var sheetName = sheet.getName();
      var data = sheet.getDataRange().getValues();
      if (data.length > 1) {
        var headers = data[0];
        // Skip header row
        for (var j = 1; j < data.length; j++) {
           var row = data[j];
           // Format untuk tabel frontend: [Tanggal Entri, Kategori, Nomor, Perihal, Link]
           var tglEntri = row[0];
           var nomor = sheetName === "Surat Masuk" ? row[4] : row[3];
           var perihal = sheetName === "Surat Masuk" ? row[5] : row[4];
           var link = row[row.length - 1]; // link file selalu di kolom terakhir
           
           allData.push({
             tanggal: tglEntri,
             kategori: sheetName,
             nomor: nomor,
             perihal: perihal,
             link: link
           });
        }
      }
    }
    return allData;
  } catch(e) {
    return [];
  }
}

// ---------------- Helper Functions ----------------

function getOrCreateDatabaseSheet(sheetName) {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('DATABASE_SHEET_ID');
  var ss;
  
  if (sheetId) {
    try {
      ss = SpreadsheetApp.openById(sheetId);
    } catch (e) {
      ss = null;
    }
  }
  
  if (!ss) {
    ss = SpreadsheetApp.create("Buku Besar - Awan Diskum");
    props.setProperty('DATABASE_SHEET_ID', ss.getId());
  }
  
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Jika Sheet1 masih kosong dan jadi default, hapus saja
    var sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet1);
    }
    
    if (sheetName === "Surat Masuk") {
      sheet.appendRow(["Waktu Entri", "Tanggal Terima Surat", "Asal Surat", "Tanggal Surat", "Nomor Surat", "Isi Ringkas (Perihal)", "Disposisi Isi", "Disposisi Unit Pengolah", "Tanda Terima", "Keterangan", "Link File"]);
    } else {
      sheet.appendRow(["Waktu Entri", "Asal Surat", "Tanggal Surat", "Nomor Surat", "Isi Ringkas (Perihal)", "Tujuan Surat", "Pengirim", "Penerima", "Keterangan", "Link File"]);
    }
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  
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
