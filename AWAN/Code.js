function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Awan Diskum - Portal Tracking & Disposisi Persuratan')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function processUpload(formObject) {
  try {
    var kategori = formObject.kategori || "Surat Masuk";
    var rootFolder = getOrCreateFolder("Awan_Diskum_Arsip");
    var categoryFolder = getOrCreateSubFolder(rootFolder, kategori);
    
    var fileUrl = "";
    // Jika ada file yang diunggah
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
    
    return { 
      success: true, 
      message: "Data " + kategori + " berhasil dicatat ke Google Sheets & Google Drive!",
      nomorSurat: formObject.nomorSurat,
      kategori: kategori,
      fileUrl: fileUrl
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getArchiveData() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('DATABASE_SHEET_ID');
  
  if (!sheetId) {
    // Inisialisasi sheet standar jika belum pernah dibuat
    try {
      var defaultSheet = getOrCreateDatabaseSheet("Surat Masuk");
      sheetId = props.getProperty('DATABASE_SHEET_ID');
    } catch(e) {
      return [];
    }
  }

  if (!sheetId) return [];

  try {
    var ss = SpreadsheetApp.openById(sheetId);
    var allData = [];
    var categories = ["Surat Masuk", "Surat Keluar", "Surat Tugas", "Surat Khusus", "Surat Keputusan"];
    
    // Pastikan sheet kategori terbaca
    for (var c = 0; c < categories.length; c++) {
      var sheetName = categories[c];
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) continue;
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) continue; // Hanya ada header
      
      // Lewati baris header (index 0)
      for (var j = 1; j < data.length; j++) {
        var row = data[j];
        var rowIndex = j + 1; // 1-based baris spreadsheet
        var tglEntri = row[0];
        var formattedEntri = formatTimestamp(tglEntri);
        
        if (sheetName === "Surat Masuk") {
          var tglTerima = formatCellDate(row[1]);
          var asal = String(row[2] || "").trim();
          var tglSurat = formatCellDate(row[3]);
          var nomor = String(row[4] || "").trim();
          var perihal = String(row[5] || "").trim();
          var dispIsi = String(row[6] || "").trim();
          var dispUnit = String(row[7] || "").trim();
          var tndTerima = String(row[8] || "").trim();
          var ket = String(row[9] || "").trim();
          var link = String(row[10] || "").trim();
          
          allData.push({
            id: sheetName + "_" + rowIndex,
            rowIndex: rowIndex,
            tanggal: formattedEntri,
            waktuEntri: formattedEntri,
            kategori: sheetName,
            nomor: nomor || "(Tanpa Nomor)",
            nomorSurat: nomor || "(Tanpa Nomor)",
            perihal: perihal || "(Tanpa Perihal)",
            asalSurat: asal || "-",
            tujuanSurat: "Dinas Koperasi dan Usaha Mikro",
            tanggalSurat: tglSurat || "-",
            tanggalTerima: tglTerima || "-",
            disposisiIsi: dispIsi || "",
            disposisiUnit: dispUnit || "",
            statusDisposisi: dispUnit ? "Sudah Disposisi" : "Belum Disposisi",
            tandaTerima: tndTerima || "-",
            pengirim: asal || "-",
            penerima: dispUnit || "Kepala Dinas",
            keterangan: ket || "-",
            link: link || "",
            hasFile: Boolean(link && link.indexOf("http") === 0)
          });
        } else {
          // Surat Keluar, Tugas, Khusus, SK
          var asal = String(row[1] || "").trim();
          var tglSurat = formatCellDate(row[2]);
          var nomor = String(row[3] || "").trim();
          var perihal = String(row[4] || "").trim();
          var tujuan = String(row[5] || "").trim();
          var pengirim = String(row[6] || "").trim();
          var penerima = String(row[7] || "").trim();
          var ket = String(row[8] || "").trim();
          var link = String(row[9] || "").trim();
          
          allData.push({
            id: sheetName + "_" + rowIndex,
            rowIndex: rowIndex,
            tanggal: formattedEntri,
            waktuEntri: formattedEntri,
            kategori: sheetName,
            nomor: nomor || "(Tanpa Nomor)",
            nomorSurat: nomor || "(Tanpa Nomor)",
            perihal: perihal || "(Tanpa Perihal)",
            asalSurat: asal || "Dinas Koperasi dan Usaha Mikro",
            tujuanSurat: tujuan || "-",
            tanggalSurat: tglSurat || "-",
            tanggalTerima: "-",
            disposisiIsi: "-",
            disposisiUnit: "-",
            statusDisposisi: "Tidak Berlaku",
            tandaTerima: "-",
            pengirim: pengirim || asal || "-",
            penerima: penerima || tujuan || "-",
            keterangan: ket || "-",
            link: link || "",
            hasFile: Boolean(link && link.indexOf("http") === 0)
          });
        }
      }
    }
    
    // Urutkan dari yang terbaru (berdasarkan tanggal entri descending)
    allData.sort(function(a, b) {
      return (b.waktuEntri || "").localeCompare(a.waktuEntri || "");
    });
    
    return allData;
  } catch(e) {
    Logger.log("Error in getArchiveData: " + e.toString());
    return [];
  }
}

function updateDisposisi(kategori, nomorSurat, disposisiUnit, disposisiIsi) {
  try {
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty('DATABASE_SHEET_ID');
    if (!sheetId) return { success: false, error: "Database Spreadsheet belum terhubung." };
    
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName(kategori || "Surat Masuk");
    if (!sheet) return { success: false, error: "Sheet " + kategori + " tidak ditemukan." };
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var rowNomor = String(data[i][4] || "").trim();
      if (rowNomor === String(nomorSurat).trim()) {
        // Kolom 7 (G): Disposisi Isi, Kolom 8 (H): Disposisi Unit
        sheet.getRange(i + 1, 7).setValue(disposisiIsi || "");
        sheet.getRange(i + 1, 8).setValue(disposisiUnit || "");
        return { success: true, message: "Disposisi untuk surat " + nomorSurat + " berhasil diperbarui di Google Sheets!" };
      }
    }
    return { success: false, error: "Nomor surat " + nomorSurat + " tidak ditemukan pada sheet " + kategori + "." };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function getSystemInfo() {
  try {
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty('DATABASE_SHEET_ID');
    var ss = null;
    if (sheetId) {
      try {
        ss = SpreadsheetApp.openById(sheetId);
      } catch(e) {}
    }
    
    return {
      connected: !!ss,
      sheetId: sheetId || "Belum dibuat",
      sheetName: ss ? ss.getName() : "Buku Besar - Awan Diskum",
      sheetUrl: ss ? ss.getUrl() : "#",
      serverTime: new Date().toISOString()
    };
  } catch(e) {
    return {
      connected: false,
      error: e.toString()
    };
  }
}

// ---------------- Helper Functions ----------------

function formatCellDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "Asia/Jakarta", "yyyy-MM-dd");
  }
  return String(val);
}

function formatTimestamp(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  }
  return String(val);
}

function getOrCreateDatabaseSheet(sheetName) {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('DATABASE_SHEET_ID');
  var ss = null;
  
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
    var sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1 && ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(sheet1);
      } catch(e) {}
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
