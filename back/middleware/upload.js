const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Crear nombre único para el archivo
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    cb(null, `${name}-${timestamp}-${random}${ext}`);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.geojson', '.json', '.shp', '.shx', '.dbf', '.zip', '.geotiff', '.tif', '.tiff'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypes = [
    'application/json',
    'application/geo+json',
    'application/zip',
    'application/x-shapefile',
    'image/tiff',
    'application/x-tiff'
  ];

  if (allowedExtensions.includes(ext) || mimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}`), false);
  }
};

// Crear instancia de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  }
});

module.exports = upload;
