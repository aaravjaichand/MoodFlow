const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, 'client', 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

console.log('Downloading face-api.js models...');

models.forEach(model => {
    const url = `${baseUrl}/${model}`;
    const filePath = path.join(modelsDir, model);

    https.get(url, (response) => {
        if (response.statusCode === 200) {
            const file = fs.createWriteStream(filePath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded: ${model}`);
            });
        } else {
            console.log(`❌ Failed to download: ${model}`);
        }
    }).on('error', (err) => {
        console.log(`❌ Error downloading ${model}:`, err.message);
    });
});

console.log('Model download started. Check the client/public/models directory.'); 