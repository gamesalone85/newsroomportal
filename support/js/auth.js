/* =========================================================
   NEWSROOM PORTAL
   AUTHENTICATION CONTROLLER
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

    1: "support/dashboard/index.html",

    2: "support/dashboard/index.html",

    3: "rooms/index.html",

    4: "rooms_admin/index.html",

    5: "cvehicular/admin/index.html",

    7: "credencializacion/index.html",

    8: "capitalhumano/index.html"

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

function cerrarSesion(
    loginUrl = "../../login.html"
) {

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
   VERIFICAR SESIÓN
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
   CREDENCIALES TEMPORALES DE DESARROLLO
=========================================================

   SOLO PARA DESARROLLO.

   No utilizar en producción.

========================================================= */

const NEWSROOM_DEMO_PASSWORDS = {

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


/* =========================================================
   AUTENTICAR USUARIO
========================================================= */

async function autenticarUsuario(
    usuario,
    password
) {

    if (
        typeof obtenerUsuarios !==
        "function"
    ) {

        throw new Error(
            "data.js no está cargado."
        );
    }


    const usuarios =
        obtenerUsuarios();


    const usuarioBuscado =
        String(usuario)
            .trim()
            .toLowerCase();


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

            success: false,

            message:
                "Usuario o contraseña incorrectos."

        };
    }


    /* =========================================
       ESTADO
    ========================================== */

    if (
        encontrado.estado !==
        "Activo"
    ) {

        return {

            success: false,

            message:
                "Este usuario se encuentra suspendido."

        };
    }


    /* =========================================
       CONTRASEÑA DEMO
    ========================================== */

    const passwordDemo =
        NEWSROOM_DEMO_PASSWORDS[
            encontrado.usuario
                .toLowerCase()
        ];


    /*
     * Usuarios originales del sistema.
     */

    if (passwordDemo) {

        if (
            password !==
            passwordDemo
        ) {

            return {

                success: false,

                message:
                    "Usuario o contraseña incorrectos."

            };
        }

    } else {

        /*
         * Usuario creado temporalmente
         * desde Administración.
         *
         * Todavía no existe backend.
         */

        if (
            !password ||
            password.length < 6
        ) {

            return {

                success: false,

                message:
                    "Usuario o contraseña incorrectos."

            };
        }
    }


    /* =========================================
       CREAR SESIÓN
    ========================================== */

    const session =
        guardarSesion(
            encontrado
        );


    return {

        success: true,

        session:
            session

    };
}


/* =========================================================
   LOGIN CENTRAL
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

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


                    window.location.href =
                        obtenerRutaPorRol(
                            resultado
                                .session
                                .rol_id
                        );


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
