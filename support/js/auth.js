/* =========================================================
   NEWSROOM PORTAL
   AUTHENTICATION CONTROLLER
   =========================================================

   Este archivo sustituye temporalmente:

       PHP Sessions
       MySQL Authentication

   Actualmente funciona con:

       localStorage

   FUTURA IMPLEMENTACIÓN:

       Firebase Authentication
       Supabase Auth
       API propia
       etc.

   ========================================================= */



/* =========================================================
   CONFIGURACIÓN
========================================================= */

const NEWSROOM_SESSION_KEY =
    "newsroomSession";



/* =========================================================
   RUTAS POR ROL
=========================================================

   Equivalente al PHP original:

   1 => support/dashboard/index.php
   2 => support/dashboard/index.php
   3 => rooms/index.php
   4 => rooms_admin/index.php
   5 => cvehicular/admin/index.php
   7 => credencializacion/index.php
   8 => capitalhumano/index.php

========================================================= */

const NEWSROOM_ROUTES = {

    1:
        "support/dashboard/index.html",

    2:
        "support/dashboard/index.html",

    3:
        "rooms/index.html",

    4:
        "rooms_admin/index.html",

    5:
        "cvehicular/admin/index.html",

    7:
        "credencializacion/index.html",

    8:
        "capitalhumano/index.html"

};



/* =========================================================
   OBTENER SESIÓN
========================================================= */

function obtenerSesion() {


    const session =
        localStorage.getItem(
            NEWSROOM_SESSION_KEY
        );


    if (!session) {

        return null;

    }


    try {

        return JSON.parse(
            session
        );

    } catch (error) {


        console.error(
            "Newsroom Portal: sesión inválida.",
            error
        );


        localStorage.removeItem(
            NEWSROOM_SESSION_KEY
        );


        return null;

    }

}



/* =========================================================
   GUARDAR SESIÓN
========================================================= */

function guardarSesion(
    usuario
) {


    const session = {

        id:
            usuario.id,

        user_id:
            usuario.id,

        usuario:
            usuario.usuario,

        nombre:
            usuario.nombre,

        rol_id:
            Number(usuario.rol_id),

        rol:
            usuario.rol,

        estado:
            usuario.estado,

        /*
         * Fecha de inicio de sesión.
         */

        loginAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        NEWSROOM_SESSION_KEY,
        JSON.stringify(
            session
        )
    );


    return session;

}



/* =========================================================
   CERRAR SESIÓN
========================================================= */

function cerrarSesion() {


    localStorage.removeItem(
        NEWSROOM_SESSION_KEY
    );


    /*
     * También podemos limpiar
     * cualquier información temporal
     * relacionada con sesión.
     */


    window.location.href =
        "../../login.html";

}



/* =========================================================
   OBTENER RUTA SEGÚN ROL
========================================================= */

function obtenerRutaPorRol(
    rol
) {


    const ruta =
        NEWSROOM_ROUTES[
            Number(rol)
        ];


    return ruta ||
        "index.html";

}



/* =========================================================
   VERIFICAR SESIÓN
=========================================================

   Uso:

       verificarSesion(
           "../../login.html"
       );

========================================================= */

function verificarSesion(
    loginUrl = "../../login.html"
) {


    const session =
        obtenerSesion();


    if (!session) {


        window.location.href =
            loginUrl;


        return false;

    }



    /*
     * Validar estado.
     */

    if (
        session.estado &&
        session.estado !==
            "Activo"
    ) {


        cerrarSesion();


        return false;

    }


    return true;

}



/* =========================================================
   VERIFICAR ROL
========================================================= */

function verificarRol(
    rolesPermitidos = []
) {


    const session =
        obtenerSesion();


    if (!session) {

        return false;

    }


    const rol =
        Number(
            session.rol_id
        );


    return rolesPermitidos
        .map(Number)
        .includes(
            rol
        );

}



/* =========================================================
   REDIRECCIÓN CENTRAL
========================================================= */

function redirigirSegunRol() {


    const session =
        obtenerSesion();


    if (!session) {


        window.location.href =
            "login.html";


        return;

    }


    const ruta =
        obtenerRutaPorRol(
            session.rol_id
        );


    window.location.href =
        ruta;

}



/* =========================================================
   LOGIN
=========================================================

   IMPORTANTE:

   Esta función es temporal.

   NO debemos utilizarla como sistema
   de autenticación definitivo.

   Cuando conectemos Firebase/Supabase/API,
   esta será la función que sustituiremos.

========================================================= */

async function autenticarUsuario(
    usuario,
    password
) {


    /*
     * Actualmente utilizamos los usuarios
     * temporales definidos en data.js.
     */

    if (
        typeof obtenerUsuarios !==
        "function"
    ) {


        throw new Error(
            "No se encontró data.js."
        );

    }


    const usuarios =
        obtenerUsuarios();


    const usuarioBuscado =
        String(
            usuario
        )
            .trim()
            .toLowerCase();


    /*
     * Buscar usuario.
     */

    const encontrado =
        usuarios.find(
            item =>
                String(
                    item.usuario
                )
                    .trim()
                    .toLowerCase() ===
                usuarioBuscado
        );


    if (!encontrado) {


        return {

            success:
                false,

            message:
                "Usuario o contraseña incorrectos."

        };

    }



    /*
     * IMPORTANTE
     *
     * Como todavía no tenemos backend,
     * no existe una contraseña real almacenada.
     *
     * Para desarrollo utilizaremos
     * una contraseña temporal basada
     * en el usuario.
     *
     * ESTO NO DEBE UTILIZARSE EN PRODUCCIÓN.
     *
     * Posteriormente esta sección será
     * reemplazada completamente por:
     *
     * Firebase Authentication
     * Supabase Auth
     * API
     *
     */

    const credencialesDemo = {

        admin:
            "admin123",

        support:
            "support123",

        rooms:
            "rooms123",

        roomsadmin:
            "rooms123",

        vehicular:
            "vehicular123",

        credencializacion:
            "credencial123",

        capitalhumano:
            "capital123"

    };



    const passwordDemo =
        credencialesDemo[
            encontrado.usuario
                .toLowerCase()
        ];



    /*
     * Usuario nuevo creado desde
     * Administración.
     *
     * Como todavía no tiene backend,
     * permitimos temporalmente cualquier
     * contraseña válida de 6 caracteres.
     *
     * Esto será reemplazado por Auth real.
     */

    const esUsuarioDemo =
        Boolean(
            passwordDemo
        );


    if (esUsuarioDemo) {


        if (
            password !==
            passwordDemo
        ) {


            return {

                success:
                    false,

                message:
                    "Usuario o contraseña incorrectos."

            };

        }

    } else {


        if (
            !password ||
            password.length <
                6
        ) {


            return {

                success:
                    false,

                message:
                    "Usuario o contraseña incorrectos."

            };

        }

    }



    /*
     * Validar estado.
     */

    if (
        encontrado.estado !==
        "Activo"
    ) {


        return {

            success:
                false,

            message:
                "Este usuario se encuentra suspendido."

        };

    }



    /*
     * Crear sesión.
     */

    const session =
        guardarSesion(
            encontrado
        );


    return {

        success:
            true,

        session:
            session

    };

}



/* =========================================================
   CONTROL DEL LOGIN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        const form =
            document.getElementById(
                "loginForm"
            );


        /*
         * Si esta página no tiene
         * formulario de login,
         * no hacemos nada.
         */

        if (!form) {

            return;

        }



        const usuarioInput =
            document.getElementById(
                "usuario"
            );


        const passwordInput =
            document.getElementById(
                "password"
            );


        const error =
            document.getElementById(
                "loginError"
            );


        const button =
            document.getElementById(
                "loginButton"
            );



        /* =================================================
           MOSTRAR ERROR
        ================================================== */

        function mostrarError(
            mensaje
        ) {


            if (!error) {

                return;

            }


            error.textContent =
                mensaje;


            error.style.display =
                "block";

        }



        /* =================================================
           OCULTAR ERROR
        ================================================== */

        function ocultarError() {


            if (!error) {

                return;

            }


            error.textContent =
                "";


            error.style.display =
                "none";

        }



        /* =================================================
           SUBMIT
        ================================================== */

        form.addEventListener(
            "submit",
            async event => {


                event.preventDefault();


                ocultarError();



                const usuario =
                    usuarioInput
                        .value
                        .trim();


                const password =
                    passwordInput
                        .value;



                if (!usuario) {


                    mostrarError(
                        "Escribe tu usuario."
                    );


                    return;

                }


                if (!password) {


                    mostrarError(
                        "Escribe tu contraseña."
                    );


                    return;

                }



                /* =========================================
                   BOTÓN
                ========================================== */

                button.disabled =
                    true;


                button.textContent =
                    "Ingresando...";



                try {


                    const resultado =
                        await autenticarUsuario(
                            usuario,
                            password
                        );


                    if (
                        !resultado.success
                    ) {


                        mostrarError(
                            resultado.message
                        );


                        button.disabled =
                            false;


                        button.textContent =
                            "Ingresar";


                        return;

                    }



                    /*
                     * LOGIN CORRECTO
                     */

                    const ruta =
                        obtenerRutaPorRol(
                            resultado.session
                                .rol_id
                        );


                    window.location.href =
                        ruta;


                } catch (errorLogin) {


                    console.error(
                        "Newsroom Portal: error de autenticación.",
                        errorLogin
                    );


                    mostrarError(
                        "No fue posible iniciar sesión."
                    );


                    button.disabled =
                        false;


                    button.textContent =
                        "Ingresar";

                }


            }
        );


    }
);
