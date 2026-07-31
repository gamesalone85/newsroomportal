```javascript
/* =========================================================
   NEWSROOM PORTAL
   AUTHENTICATION CONTROLLER
   FIREBASE
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const NEWSROOM_SESSION_KEY =
    "newsroomSession";


/* =========================================================
   RUTAS POR ROL
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
   OBTENER SESIÓN LOCAL
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

    if (!usuario) {

        console.error(
            "Newsroom Portal: no se recibió perfil de usuario."
        );

        return null;

    }


    const session = {

        id:
            usuario.id || null,

        uid:
            usuario.uid || null,

        user_id:
            usuario.uid ||
            usuario.id ||
            null,

        usuario:
            usuario.usuario || "",

        nombre:
            usuario.nombre || "",

        correo:
            usuario.correo || "",

        rol_id:
            Number(
                usuario.rol_id || 0
            ),

        rol:
            usuario.rol || "",

        estado:
            usuario.estado || "Activo",

        loginAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        NEWSROOM_SESSION_KEY,
        JSON.stringify(session)
    );


    return session;

}


/* =========================================================
   CERRAR SESIÓN
========================================================= */

async function cerrarSesion(
    loginUrl = "../../login.html"
) {

    try {

        if (
            typeof newsroomAuth !==
            "undefined"
        ) {

            await newsroomAuth.signOut();

        }

    } catch (error) {

        console.error(
            "Newsroom Portal: error cerrando sesión Firebase.",
            error
        );

    }


    localStorage.removeItem(
        NEWSROOM_SESSION_KEY
    );


    window.location.href =
        loginUrl;

}


/* =========================================================
   OBTENER RUTA POR ROL
========================================================= */

function obtenerRutaPorRol(
    rol
) {

    return (
        NEWSROOM_ROUTES[
            Number(rol)
        ] ||
        "index.html"
    );

}


/* =========================================================
   VERIFICAR SESIÓN LOCAL
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


    if (
        session.estado &&
        session.estado !== "Activo"
    ) {

        cerrarSesion(
            loginUrl
        );

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
        .includes(rol);

}


/* =========================================================
   REDIRECCIÓN POR ROL
========================================================= */

function redirigirSegunRol() {

    const session =
        obtenerSesion();


    if (!session) {

        window.location.href =
            "login.html";

        return;

    }


    window.location.href =
        obtenerRutaPorRol(
            session.rol_id
        );

}


/* =========================================================
   AUTENTICAR USUARIO
========================================================= */

async function autenticarUsuario(
    usuario,
    password
) {

    if (
        typeof newsroomAuth ===
        "undefined"
    ) {

        throw new Error(
            "Firebase Authentication no está disponible."
        );

    }


    const usuarioNormalizado =
        String(usuario)
            .trim()
            .toLowerCase();


    const passwordNormalizada =
        String(password);


    if (
        !usuarioNormalizado ||
        !passwordNormalizada
    ) {

        return {

            success:
                false,

            message:
                "Ingresa tu usuario y contraseña."

        };

    }


    /*
     * -----------------------------------------------------
     * ACTUALMENTE EL LOGIN UTILIZARÁ CORREO
     * COMO IDENTIFICADOR DE FIREBASE.
     *
     * Posteriormente podemos recuperar el usuario
     * mediante un alias/usuario de Firestore.
     * -----------------------------------------------------
     */

    let correo =
        usuarioNormalizado;


    /*
     * Si el usuario escribe solamente "admin",
     * temporalmente lo convertimos al correo
     * registrado en nuestro sistema.
     *
     * ESTO ES SOLO PARA LA MIGRACIÓN INICIAL.
     */

    const correosTemporales = {

        admin:
            "admin@newsroomportal.com",

        support:
            "support@newsroomportal.com",

        rooms:
            "rooms@newsroomportal.com",

        roomsadmin:
            "roomsadmin@newsroomportal.com",

        vehicular:
            "vehicular@newsroomportal.com",

        credencializacion:
            "credencializacion@newsroomportal.com",

        capitalhumano:
            "capitalhumano@newsroomportal.com"

    };


    if (
        correosTemporales[
            usuarioNormalizado
        ]
    ) {

        correo =
            correosTemporales[
                usuarioNormalizado
            ];

    }


    try {

        /*
         * -------------------------------------------------
         * FIREBASE AUTHENTICATION
         * -------------------------------------------------
         */

        const resultado =
            await newsroomAuth
                .signInWithEmailAndPassword(
                    correo,
                    passwordNormalizada
                );


        const firebaseUser =
            resultado.user;


        if (!firebaseUser) {

            return {

                success:
                    false,

                message:
                    "No fue posible identificar al usuario."

            };

        }


        /*
         * -------------------------------------------------
         * OBTENER PERFIL DE FIRESTORE
         * -------------------------------------------------
         */

        const perfilSnapshot =
            await newsroomDB
                .collection("usuarios")
                .doc(firebaseUser.uid)
                .get();


        if (
            !perfilSnapshot.exists
        ) {

            /*
             * Si Authentication funciona pero
             * todavía no existe el perfil,
             * cerramos la sesión.
             */

            await newsroomAuth.signOut();


            return {

                success:
                    false,

                message:
                    "La cuenta existe, pero todavía no tiene un perfil registrado en Newsroom."

            };

        }


        const perfil =
            perfilSnapshot.data();


        /*
         * -------------------------------------------------
         * VERIFICAR ESTADO
         * -------------------------------------------------
         */

        if (
            perfil.estado &&
            perfil.estado !== "Activo"
        ) {

            await newsroomAuth.signOut();


            return {

                success:
                    false,

                message:
                    "Este usuario se encuentra suspendido."

            };

        }


        /*
         * -------------------------------------------------
         * CONSTRUIR PERFIL DE SESIÓN
         * -------------------------------------------------
         */

        const usuarioNewsroom = {

            id:
                perfil.id ||
                firebaseUser.uid,

            uid:
                firebaseUser.uid,

            usuario:
                perfil.usuario ||
                firebaseUser.email,

            nombre:
                perfil.nombre ||
                firebaseUser.displayName ||
                "",

            correo:
                perfil.correo ||
                firebaseUser.email ||
                "",

            rol_id:
                Number(
                    perfil.rol_id || 0
                ),

            rol:
                perfil.rol ||
                "",

            estado:
                perfil.estado ||
                "Activo"

        };


        /*
         * -------------------------------------------------
         * GUARDAR SESIÓN COMPATIBLE
         * -------------------------------------------------
         */

        const session =
            guardarSesion(
                usuarioNewsroom
            );


        return {

            success:
                true,

            session:
                session,

            usuario:
                usuarioNewsroom

        };


    } catch (error) {

        console.error(
            "Newsroom Portal: error Firebase Authentication.",
            error
        );


        let mensaje =
            "Usuario o contraseña incorrectos.";


        switch (
            error.code
        ) {

            case "auth/invalid-credential":

                mensaje =
                    "Usuario o contraseña incorrectos.";

                break;


            case "auth/user-not-found":

                mensaje =
                    "Usuario o contraseña incorrectos.";

                break;


            case "auth/wrong-password":

                mensaje =
                    "Usuario o contraseña incorrectos.";

                break;


            case "auth/too-many-requests":

                mensaje =
                    "Demasiados intentos. Espera unos minutos e inténtalo nuevamente.";

                break;


            case "auth/network-request-failed":

                mensaje =
                    "No fue posible conectar con Firebase.";

                break;

        }


        return {

            success:
                false,

            message:
                mensaje

        };

    }

}


/* =========================================================
   INICIO AUTOMÁTICO DEL LOGIN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "loginForm"
            );


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


        function ocultarError() {

            if (!error) {

                return;

            }


            error.textContent =
                "";


            error.style.display =
                "none";

        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                ocultarError();


                const usuario =
                    usuarioInput.value.trim();


                const password =
                    passwordInput.value;


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


                if (button) {

                    button.disabled =
                        true;

                    button.textContent =
                        "Ingresando...";

                }


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

                        return;

                    }


                    /*
                     * -------------------------------------------------
                     * REDIRECCIÓN
                     * -------------------------------------------------
                     */

                    window.location.href =
                        obtenerRutaPorRol(
                            resultado
                                .session
                                .rol_id
                        );


                } catch (errorLogin) {

                    console.error(
                        "Newsroom Portal: error durante el login.",
                        errorLogin
                    );


                    mostrarError(
                        "No fue posible iniciar sesión."
                    );

                } finally {

                    if (button) {

                        button.disabled =
                            false;

                        button.textContent =
                            "Ingresar";

                    }

                }

            }
        );

    }
);
```
