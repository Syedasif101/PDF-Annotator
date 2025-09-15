const fs = require('fs');
const path = require('path');

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads folder created successfully! 📁');
} else {
  console.log('Uploads folder already exists! ✅');
}
