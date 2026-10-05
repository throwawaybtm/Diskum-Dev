function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Awan Diskum - Portal Arsip')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Fungsi utama yang dipanggil dari frontend saat tombol "Simpan" ditekan
function processUpload(formObject) {
  try {
    // 1. LEMARI ARSIP (Drive): Cari atau buat folder utama dan sub-folder kategori
    var rootFolder = getOrCreateFolder("Awan_Diskum_Arsip");
    var categoryFolder = getOrCreateSubFolder(rootFolder, formObject.kategori);
    
    // Simpan file PDF ke dalam folder kategori tersebut
    var fileBlob = formObject.file;
    var savedFile = categoryFolder.createFile(fileBlob);
    var fileUrl = savedFile.getUrl();
    
    // 2. BUKU BESAR (Sheets): Simpan data teks ke Google Sheets
    // Asumsi: Script ini dibuat menyatu (bound) dengan Google Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var timestamp = new Date();
    
    // Tambahkan baris baru: [Waktu, Nomor Surat, Tanggal, Perihal, Kategori, Link File]
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

// Fitur Pencarian & Dasbor
function getArchiveData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Hapus baris pertama (header) untuk dikembalikan ke frontend
  if(data.length > 0) {
    data.shift(); 
  }
  return data;
}

// Fungsi Bantuan (Helpers) untuk Folder Drive
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
