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
   INICIALIZAR APP PRINCIPAL
========================================================= */

const newsroomApp =
    firebase.initializeApp(
        firebaseConfig
    );


/* =========================================================
   SERVICIOS PRINCIPALES
========================================================= */

const newsroomAuth =
    newsroomApp.auth();


const newsroomDB =
    newsroomApp.firestore();


/* =========================================================
   APP SECUNDARIA
   Se utiliza exclusivamente para crear usuarios.
   
   Esto evita cerrar la sesión del administrador actual.
========================================================= */

let newsroomSecondaryApp = null;

let newsroomSecondaryAuth = null;


try {

    newsroomSecondaryApp =
        firebase.initializeApp(
            firebaseConfig,
            "NewsroomUserCreation"
        );


    newsroomSecondaryAuth =
        newsroomSecondaryApp.auth();


}
catch (error) {

    console.error(
        "Newsroom Portal: error inicializando Auth secundaria.",
        error
    );

}


/* =========================================================
   CONFIRMACIÓN
========================================================= */

console.log(
    "Newsroom Portal: Firebase inicializado correctamente."
);

console.log(
    "Firebase Auth principal:",
    !!newsroomAuth
);

console.log(
    "Firebase Firestore:",
    !!newsroomDB
);

console.log(
    "Firebase Auth secundaria:",
    !!newsroomSecondaryAuth
);
