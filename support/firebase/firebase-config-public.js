/* =========================================================
NEWSROOM PORTAL
FIREBASE CONFIGURATION
MESA DE AYUDA PÚBLICA

IMPORTANTE:

Este archivo NO utiliza Firebase Authentication.

La Mesa de Ayuda pública funciona como módulo
independiente y únicamente utiliza Firestore.
========================================================= */

/* =========================================================
CONFIGURACIÓN FIREBASE
========================================================= */

const firebaseConfigPublic = {

apiKey:
    "AIzaSyAKTU9b2uu5g-vaSdsN2OmXaVh59Cp0NVQ",

authDomain:
    "support-b00c9.firebaseapp.com",

projectId:
    "support-b00c9",

storageBucket:
    "support-b00c9.firebasestorage.app",

messagingSenderId:
    "713373407081",

appId:
    "1:713373407081:web:1c4ca92a6cfb7ab7580ff8",

measurementId:
    "G-5DG3Y05VTS"


};

/* =========================================================
VERIFICAR SDK
========================================================= */

if (
typeof firebase === "undefined"
) {


console.error(
    "Newsroom Portal: Firebase SDK no está cargado."
);

throw new Error(
    "Firebase SDK no está cargado."
);


}

/* =========================================================
INICIALIZAR FIREBASE PÚBLICO
========================================================= */

const newsroomPublicApp =
firebase.initializeApp(
firebaseConfigPublic
);

/* =========================================================
FIRESTORE
========================================================= */

const newsroomPublicDB =
newsroomPublicApp.firestore();

/* =========================================================
CONFIRMACIÓN
========================================================= */

console.log(
"Newsroom Portal: Firebase público inicializado correctamente."
);

console.log(
"Firestore público:",
!!newsroomPublicDB
);
