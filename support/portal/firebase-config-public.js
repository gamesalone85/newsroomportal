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
   VARIABLES PÚBLICAS
========================================================= */

let newsroomPublicApp = null;

let newsroomPublicDB = null;


/* =========================================================
   INICIALIZAR FIREBASE PÚBLICO
========================================================= */

try {

    /*
     * Evitar inicializar dos veces la misma aplicación.
     */

    try {

        newsroomPublicApp =
            firebase.app(
                "NewsroomPublic"
            );

    }
    catch (error) {

        newsroomPublicApp =
            firebase.initializeApp(
                firebaseConfigPublic,
                "NewsroomPublic"
            );

    }


    /* =====================================================
       FIRESTORE
    ===================================================== */

    newsroomPublicDB =
        newsroomPublicAhttps://tikfinity.zerody.one/#actionsandeventspp.firestore();


    console.log(
        "Newsroom Portal: Firebase público inicializado correctamente."
    );


    console.log(
        "Firestore público:",
        !!newsroomPublicDB
    );

}
catch (error) {

    console.error(
        "Newsroom Portal: error inicializando Firebase público.",
        error
    );

    newsroomPublicApp = null;

    newsroomPublicDB = null;

}
