/* =========================================================
   NEWSROOM PORTAL
   FIREBASE CONFIGURATION
   Proyecto: support
========================================================= */

const firebaseConfig = {

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
   INICIALIZAR FIREBASE
========================================================= */

firebase.initializeApp(
    firebaseConfig
);


/* =========================================================
   SERVICIOS
========================================================= */

const newsroomAuth =
    firebase.auth();


const newsroomDB =
    firebase.firestore();


console.log(
    "Newsroom Portal: Firebase inicializado correctamente."
);

