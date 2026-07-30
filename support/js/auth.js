```javascript
/* =========================================================
   NEWSROOM PORTAL
   SISTEMA DE AUTENTICACIÓN
   =========================================================

   Sustituye temporalmente:

   support/config/session.php

   Actualmente utiliza:

   localStorage

   FUTURA CONEXIÓN:

   Firebase Authentication
   Supabase Auth
   Google Authentication
   API propia
   etc.

   ========================================================= */


/* =========================================================
   OBTENER SESIÓN ACTUAL
========================================================= */

function obtenerSesion() {

    const sessionData =
        localStorage.getItem(
            "newsroomSession"
        );


    if (!sessionData) {

        return null;

    }


    try {

        return JSON.parse(
            sessionData
        );

    } catch (error) {

        console.error(
            "Newsroom Portal: sesión inválida.",
            error
        );


        localStorage.removeItem(
            "newsroomSession"
        );


        return null;

    }

}



/* =========================================================
   COMPROBAR AUTENTICACIÓN
========================================================= */

function verificarSesion(
    redireccion = "../login.html"
) {


    const session =
        obtenerSesion();


    if (
        !session ||
        !session.autenticado
    ) {


        window.location.href =
            redireccion;


        return false;

    }


    return true;

}



/* =========================================================
   OBTENER USUARIO
========================================================= */

function obtenerUsuarioActual() {


    const session =
        obtenerSesion();


    if (!session) {

        return null;

    }


    return {

        id:
            session.id,

        usuario:
            session.usuario,

        nombre:
            session.nombre,

        rol_id:
            Number(session.rol_id)

    };

}



/* =========================================================
   COMPROBAR ROL
========================================================= */

function verificarRol(
    rolPermitido,
    redireccion = "../dashboard/index.html"
) {


    const session =
        obtenerSesion();


    if (!session) {


        window.location.href =
            "../login.html";


        return false;

    }


    if (
        Number(session.rol_id) !==
        Number(rolPermitido)
    ) {


        window.location.href =
            redireccion;


        return false;

    }


    return true;

}



/* =========================================================
   CERRAR SESIÓN
========================================================= */

function cerrarSesion() {


    /*
     * ======================================================
     * FUTURA AUTENTICACIÓN
     *
     * Aquí podremos cerrar sesión mediante:
     *
     * Firebase Auth
     * Supabase Auth
     * API
     *
     * ======================================================
     */


    localStorage.removeItem(
        "newsroomSession"
    );


    window.location.href =
        "../login.html";

}



/* =========================================================
   OBTENER ROL
========================================================= */

function obtenerRolActual() {


    const session =
        obtenerSesion();


    if (!session) {

        return null;

    }


    return Number(
        session.rol_id
    );

}
```
