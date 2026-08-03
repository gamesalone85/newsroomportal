
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

    }
    catch (error) {

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
            usuario.id ||
            null,

        uid:
            usuario.uid ||
            null,

        user_id:
            usuario.uid ||
            usuario.id ||
            null,

        usuario:
            usuario.usuario ||
            "",

        nombre:
            usuario.nombre ||
            "",

        correo:
            usuario.correo ||
            "",

        rol_id:
            Number(
                usuario.rol_id ||
                0
            ),

        rol:
            usuario.rol ||
            "",

        estado:
            usuario.estado ||
            "Activo",

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

    }
    catch (error) {

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
   NORMALIZAR USUARIO
========================================================= */

function normalizarUsuario(
    usuario
) {

    return String(
        usuario ||
        ""
    )
    .trim()
    .toLowerCase();

}


/* =========================================================
   DETERMINAR SI ES CORREO
========================================================= */

function esCorreo(
    valor
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            String(valor || "")
                .trim()
        );

}


/* =========================================================
   CORREOS TEMPORALES DEL SISTEMA
=========================================================

   Estos corresponden a cuentas administrativas
   antiguas que ya tenían un correo definido.

========================================================= */

const NEWSROOM_CORREOS_SISTEMA = {

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


/* =========================================================
   OBTENER CORREO DE ACCESO
========================================================= */

function obtenerCorreoDeAcceso(
    usuario
) {

    const valor =
        normalizarUsuario(
            usuario
        );


    if (!valor) {

        return null;

    }


    /*
     * Si el usuario ya escribió un correo,
     * utilizamos directamente ese correo.
     */

    if (
        esCorreo(valor)
    ) {

        return valor;

    }


    /*
     * Compatibilidad con cuentas administrativas
     * antiguas.
     */

    if (
        NEWSROOM_CORREOS_SISTEMA[
            valor
        ]
    ) {

        return NEWSROOM_CORREOS_SISTEMA[
            valor
        ];

    }


    /*
     * IMPORTANTE:
     *
     * Un nombre de usuario normal no puede
     * convertirse automáticamente en correo.
     *
     * Firebase Authentication necesita un correo
     * real asociado a la cuenta.
     */

    return null;

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

        return {

            success:
                false,

            message:
                "Firebase Authentication no está disponible."

        };

    }


    if (
        typeof newsroomDB ===
        "undefined"
    ) {

        return {

            success:
                false,

            message:
                "Firebase Firestore no está disponible."

        };

    }


    const usuarioNormalizado =
        normalizarUsuario(
            usuario
        );


    const passwordNormalizada =
        String(
            password ||
            ""
        );


    /* =====================================================
       VALIDACIÓN
    ===================================================== */

    if (!usuarioNormalizado) {

        return {

            success:
                false,

            message:
                "Ingresa tu usuario o correo."

        };

    }


    if (!passwordNormalizada) {

        return {

            success:
                false,

            message:
                "Ingresa tu contraseña."

        };

    }


    /* =====================================================
       OBTENER CORREO
    ===================================================== */

    const correo =
        obtenerCorreoDeAcceso(
            usuarioNormalizado
        );


    /*
     * Si no es correo y tampoco pertenece a las
     * cuentas administrativas antiguas, todavía
     * no podemos enviarlo a Firebase Auth.
     */

    if (!correo) {

        return {

            success:
                false,

            message:
                "Para esta cuenta debes ingresar el correo electrónico registrado."

        };

    }


    console.log(
        "Newsroom Portal: intentando autenticar:",
        correo
    );


    try {

        /* =================================================
           FIREBASE AUTHENTICATION
        ================================================= */

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


        console.log(
            "Newsroom Portal: autenticación Firebase correcta.",
            firebaseUser.uid
        );


        /* =================================================
           OBTENER PERFIL
        ================================================= */

        const perfilSnapshot =
            await newsroomDB
                .collection("usuarios")
                .doc(
                    firebaseUser.uid
                )
                .get();


        if (
            !perfilSnapshot.exists
        ) {

            await newsroomAuth.signOut();


            return {

                success:
                    false,

                message:
                    "La cuenta existe en Firebase, pero no tiene un perfil registrado en Newsroom."

            };

        }


        const perfil =
            perfilSnapshot.data();


        /* =================================================
           VERIFICAR ESTADO
        ================================================= */

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


        /* =================================================
           VERIFICAR ROL
        ================================================= */

        const rolId =
            Number(
                perfil.rol_id ||
                0
            );


        if (!rolId) {

            await newsroomAuth.signOut();


            return {

                success:
                    false,

                message:
                    "El usuario no tiene un rol asignado."

            };

        }


        /* =================================================
           CONSTRUIR PERFIL NEWSROOM
        ================================================= */

        const usuarioNewsroom = {

            id:
                perfil.id ||
                firebaseUser.uid,

            uid:
                firebaseUser.uid,

            usuario:
                perfil.usuario ||
                firebaseUser.email ||
                "",

            nombre:
                perfil.nombre ||
                firebaseUser.displayName ||
                "",

            correo:
                perfil.correo ||
                firebaseUser.email ||
                "",

            rol_id:
                rolId,

            rol:
                perfil.rol ||
                "",

            estado:
                perfil.estado ||
                "Activo"

        };


        /* =================================================
           GUARDAR SESIÓN
        ================================================= */

        const session =
            guardarSesion(
                usuarioNewsroom
            );


        if (!session) {

            await newsroomAuth.signOut();


            return {

                success:
                    false,

                message:
                    "No fue posible crear la sesión del usuario."

            };

        }


        console.log(
            "Newsroom Portal: sesión creada correctamente.",
            session
        );


        return {

            success:
                true,

            session:
                session,

            usuario:
                usuarioNewsroom

        };

    }
    catch (error) {

        console.error(
            "Newsroom Portal: error Firebase Authentication.",
            error
        );


        let mensaje =
            "Usuario o contraseña incorrectos.";


        switch (
            error.code
        ) {

            case "auth/invalid-email":

                mensaje =
                    "El correo electrónico no tiene un formato válido.";

                break;


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


            case "auth/user-disabled":

                mensaje =
                    "Esta cuenta de Firebase está deshabilitada.";

                break;


            case "auth/too-many-requests":

                mensaje =
                    "Demasiados intentos. Espera unos minutos e inténtalo nuevamente.";

                break;


            case "auth/network-request-failed":

                mensaje =
                    "No fue posible conectar con Firebase.";

                break;


            case "auth/operation-not-allowed":

                mensaje =
                    "El método de acceso por correo y contraseña no está habilitado en Firebase Authentication.";

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
                    usuarioInput
                        ? usuarioInput.value.trim()
                        : "";


                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                if (!usuario) {

                    mostrarError(
                        "Escribe tu usuario o correo."
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


                    /* =========================================
                       REDIRECCIÓN POR ROL
                    ========================================= */

                    const ruta =
                        obtenerRutaPorRol(
                            resultado
                                .session
                                .rol_id
                        );


                    console.log(
                        "Newsroom Portal: redirigiendo a:",
                        ruta
                    );


                    window.location.href =
                        ruta;

                }
                catch (errorLogin) {

                    console.error(
                        "Newsroom Portal: error durante el login.",
                        errorLogin
                    );


                    mostrarError(
                        "No fue posible iniciar sesión."
                    );

                }
                finally {

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

