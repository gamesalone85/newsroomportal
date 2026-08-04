/* =========================================================
   NEWSROOM PORTAL
   MESA DE AYUDA PÚBLICA
   FIREBASE CONFIGURATION

   IMPORTANTE:

   Esta configuración es EXCLUSIVA para la Mesa de Ayuda
   pública.

   NO utiliza Firebase Authentication.

   El usuario puede crear un ticket sin iniciar sesión.
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
   VERIFICAR FIREBASE SDK
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
   INICIALIZAR APP PÚBLICA
========================================================= */

let newsroomPublicApp = null;

let newsroomPublicDB = null;


try {

    newsroomPublicApp =
        firebase.initializeApp(
            firebaseConfigPublic,
            "NewsroomPublic"
        );


    newsroomPublicDB =
        newsroomPublicApp.firestore();


}
catch (error) {

    console.error(
        "Newsroom Portal: error inicializando Firebase público.",
        error
    );

}



/* =========================================================
   CONFIRMACIÓN
========================================================= */

console.log(
    "Newsroom Portal: Firebase público inicializado."
);


console.log(
    "Firestore público:",
    !!newsroomPublicDB
);
