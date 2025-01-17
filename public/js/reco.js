const video = document.getElementById('inputVideo');
let registeredDescriptor = null;

(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    const MODEL_URL = '/public/models';
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
})();

async function registerFace() {
    const detection = await faceapi.detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        alert('No se detectó una cara en el video.');
        return;
    }

    registeredDescriptor = detection.descriptor;
    alert('Cara registrada exitosamente.');
}

async function verifyFace() {
    if (!registeredDescriptor) {
        alert('Primero registra una cara.');
        return;
    }

    const captures = [];
    for (let i = 0; i < 3; i++) {
        const currentFace = await faceapi.detectSingleFace(video)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (currentFace) {
            captures.push(currentFace);
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            alert('No se detectó una cara en el video.');
            return;
        }
    }

    let faceVerified = false;
    let texturesDetected = 0;

    for (const face of captures) {
        const distance = faceapi.euclideanDistance(registeredDescriptor, face.descriptor);
        const threshold = 0.6;

        if (distance < threshold) {
            faceVerified = true;
        }

        const imgData = await getImageDataFromVideo(video);
        const texture = calculateTexture(imgData);

        if (texture > 50) {
            texturesDetected++;
        }
    }

    if (faceVerified && texturesDetected >= 2) {
        alert('Acceso permitido.');
    } else {
        alert('Acceso denegado.');
    }
}

function calculateTexture(imageData) {
    let totalTexture = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];    
        totalTexture += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    }
    return totalTexture / (imageData.data.length / 4);
}

function getImageDataFromVideo(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

document.getElementById('registerButton').addEventListener('click', registerFace);
document.getElementById('verifyButton').addEventListener('click', verifyFace);





