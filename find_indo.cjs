const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
}

const files = walkSync('d:/KULIAH/Semester4/ProjectAkhir/BarberShop/barber-react/src');

const indonesianWords = [
  'Kembali', 'Simpan', 'Batal', 'Tutup', 'Ubah', 'Hapus', 'Keluar', 'Antrean', 'Jadwal',
  'Layanan', 'Kapster', 'Pelanggan', 'Selesai', 'Tidak', 'Ada', 'Belum', 'Bulan', 'Tahun',
  'Hari', 'Gagal', 'Berhasil', 'Silakan', 'Pilih', 'Masukkan', 'Cari', 'Daftar', 'Masuk',
  'Sandi', 'Lupa', 'Pesan', 'Sekarang', 'Atau', 'Dan', 'Ke', 'Di', 'Dari', 'Dengan', 'Untuk',
  'Yang', 'Ini', 'Itu', 'Saya', 'Anda', 'Bisa', 'Sudah', 'Akan', 'Apakah', 'Bagaimana',
  'Kapan', 'Kenapa', 'Siapa', 'Dimana', 'Konfirmasi', 'Laporan', 'Pengaturan', 'Promosi',
  'Member', 'Batal', 'Bayar', 'Total', 'Harga', 'Menit', 'Aksi', 'Rp'
];

// Compile a regex to find these words (case insensitive, whole words)
const regex = new RegExp(`\\b(${indonesianWords.join('|')})\\b`, 'i');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Simple heuristic: look for matches outside of imports and typical JS code, preferably in strings or JSX text
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Ignore lines that are just imports
    if (line.trim().startsWith('import ') || line.trim().startsWith('export ')) return;
    
    // Check if line contains one of the words
    const match = line.match(regex);
    if (match) {
        // filter out 'Total', 'Member', 'Rp', 'Di', 'Ke' false positives which are often fine or CSS properties (like display, flex-direction etc. but \b protects some)
        // actually just dump lines that match
        if (line.includes('<') && line.includes('>')) {
            console.log(`${path.basename(file)}:${i+1}: ${line.trim()}`);
        }
    }
  });
});
