const video = document.getElementById('inputVideo');
const canvas = document.getElementById('overlay');
let registeredDescriptor = null; // Aquí se guarda el vector del analisis de momento

(async () => {
    // Esto es para cargar la camara, pedir el permiso y cargar los modelos entrenados de la libreria 
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    const MODEL_URL = '/public/models';
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
})();

// Esta funcion registra la cara por primera vez y llama a la libreria para hacer el analisis
async function registerFace() {
    const detection = await faceapi.detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        alert('No se detectó una cara en el video.');
        return;
    }

    registeredDescriptor = detection.descriptor;
    //Acá se puede llamar al servicio de la db y guardar el vector del descriptor en JSON relacionandolo con un user 

    alert('Cara registrada exitosamente.');
}

// Esta funcion verifica la cara que está registrada con la que se muestra en la camara
async function verifyFace() {
    if (!registeredDescriptor) {
        alert('Primero registra una cara.');
        return;
    }
    //Acá se puede llamar al servicio de la db y traer el vector del descriptor que está en la db asociado a un user
    const currentFace = await faceapi.detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!currentFace) {
        alert('No se detectó una cara en el video.');
        return;
    }

    // Aquí hace la comparacion de las 2 caras
    const distance = faceapi.euclideanDistance(registeredDescriptor, currentFace.descriptor);
    const threshold = 0.6; // Aquí se ajusta segun las necesidades y la seguridad
    alert(distance < threshold ? 'Es la misma persona.' : 'No es la misma persona.');
}

document.getElementById('registerButton').addEventListener('click', registerFace);
document.getElementById('verifyButton').addEventListener('click', verifyFace);