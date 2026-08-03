/* =========================================================
   NEWSROOM PORTAL
   CREAR USUARIO
   FIREBASE AUTHENTICATION + FIRESTORE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Newsroom Portal: nuevo_usuario.js cargado correctamente."
        );


        /* =====================================================
           VERIFICAR FUNCIONES DE SESIÓN
        ===================================================== */

        if (
            typeof verificarSesion !== "function" ||
            typeof obtenerSesion !== "function"
        ) {

            console.error(
                "Newsroom Portal: auth.js no está disponible."
            );

            return;

        }


        /* =====================================================
           VERIFICAR SESIÓN
        ===================================================== */

        if (
            !verificarSesion(
                "../../login.html"
            )
        ) {

            return;

        }


        /* =====================================================
           OBTENER SESIÓN
        ===================================================== */

        const session =
            obtenerSesion();


        if (!session) {

            console.error(
                "Newsroom Portal: no existe una sesión activa."
            );

            return;

        }


        /* =====================================================
           VERIFICAR PERMISOS
           
           1 = Administrador
           4 = Rooms Admin
        ===================================================== */

        const rolActual =
            Number(
                session.rol_id
            );


        if (
            rolActual !== 1 &&
            rolActual !== 4
        ) {

            alert(
                "No tienes permisos para crear usuarios."
            );


            window.location.href =
                "../dashboard/index.html";


            return;

        }


        /* =====================================================
           VERIFICAR FIREBASE
        ===================================================== */

        if (
            typeof firebase === "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firebase SDK no está disponible."
            );

            return;

        }


        if (
            typeof newsroomAuth === "undefined" ||
            typeof newsroomDB === "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firebase Auth o Firestore no están disponibles."
            );

            return;

        }


        if (
            typeof newsroomSecondaryAuth === "undefined" ||
            !newsroomSecondaryAuth
        ) {

            console.error(
                "Newsroom Portal: Firebase Auth secundaria no está disponible."
            );

            return;

        }


        console.log(
            "Newsroom Portal: Firebase Auth y Firestore disponibles."
        );


        /* =====================================================
           USUARIO ACTUAL
        ===================================================== */

        actualizarUsuario(
            session
        );


        /* =====================================================
           CARGAR ROLES
        ===================================================== */

        cargarRoles();


        /* =====================================================
           CONFIGURAR FORMULARIO
        ===================================================== */

        configurarFormulario();

    }
);


/* =========================================================
   ROLES DEL SISTEMA
========================================================= */

const NEWSROOM_ROLES =
    [

        {
            id: 1,
            nombre: "Administrador"
        },

        {
            id: 2,
            nombre: "Soporte"
        },

        {
            id: 3,
            nombre: "Usuario"
        },

        {
            id: 4,
            nombre: "Rooms Admin"
        }

    ];


/* =========================================================
   ACTUALIZAR INFORMACIÓN DEL ADMINISTRADOR
========================================================= */

function actualizarUsuario(
    session
) {

    const userName =
        document.getElementById(
            "userName"
        );


    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


    const nombre =
        session.nombre ||
        session.usuario ||
        session.email ||
        "Administrador";


    if (userName) {

        userName.textContent =
            nombre;

    }


    if (userAvatar) {

        userAvatar.textContent =
            nombre
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================================
   CARGAR ROLES
========================================================= */

function cargarRoles() {

    console.log(
        "Newsroom Portal: cargando roles del sistema..."
    );


    const rolSelect =
        document.getElementById(
            "rol_id"
        );


    if (!rolSelect) {

        console.error(
            "Newsroom Portal: no existe el selector #rol_id."
        );

        return;

    }


    rolSelect.innerHTML = `

        <option value="">
            Selecciona un rol
        </option>

    `;


    NEWSROOM_ROLES.forEach(
        function (rol) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                rol.id;


            option.textContent =
                rol.nombre;


            rolSelect.appendChild(
                option
            );

        }
    );


    console.log(
        "Newsroom Portal: roles cargados correctamente.",
        NEWSROOM_ROLES
    );

}


/* =========================================================
   CONFIGURAR FORMULARIO
========================================================= */

function configurarFormulario() {

    const form =
        document.getElementById(
            "nuevoUsuarioForm"
        );


    if (!form) {

        console.error(
            "Newsroom Portal: no existe #nuevoUsuarioForm."
        );

        return;

    }


    form.addEventListener(
        "submit",
        crearNuevoUsuario
    );


    console.log(
        "Newsroom Portal: formulario de nuevo usuario configurado."
    );

}


/* =========================================================
   CREAR NUEVO USUARIO
========================================================= */

async function crearNuevoUsuario(
    event
) {

    event.preventDefault();


    console.log(
        "Newsroom Portal: iniciando creación de usuario..."
    );


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const formMessage =
        document.getElementById(
            "formMessage"
        );


    const guardarButton =
        document.getElementById(
            "guardarUsuario"
        );


    const nombreInput =
        document.getElementById(
            "nombre"
        );


    const usuarioInput =
        document.getElementById(
            "usuario"
        );


    const correoInput =
        document.getElementById(
            "correo"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const rolInput =
        document.getElementById(
            "rol_id"
        );


    /* =====================================================
       DATOS
    ===================================================== */

    const nombre =
        nombreInput
            ? nombreInput.value.trim()
            : "";


    const usuario =
        usuarioInput
            ? usuarioInput.value.trim()
            : "";


    const correo =
        correoInput
            ? correoInput.value.trim().toLowerCase()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    const rol_id =
        rolInput
            ? Number(
                rolInput.value
            )
            : 0;


    /* =====================================================
       LIMPIAR MENSAJE
    ===================================================== */

    ocultarMensaje();


    /* =====================================================
       VALIDAR NOMBRE
    ===================================================== */

    if (!nombre) {

        mostrarMensaje(
            "Escribe el nombre completo del usuario."
        );

        return;

    }


    /* =====================================================
       VALIDAR USUARIO
    ===================================================== */

    if (!usuario) {

        mostrarMensaje(
            "Escribe el nombre de usuario."
        );

        return;

    }


    /* =====================================================
       VALIDAR CORREO
    ===================================================== */

    if (!correo) {

        mostrarMensaje(
            "Escribe el correo electrónico."
        );

        return;

    }


    /* =====================================================
       VALIDAR CONTRASEÑA
    ===================================================== */

    if (
        !password ||
        password.length < 6
    ) {

        mostrarMensaje(
            "La contraseña debe tener al menos 6 caracteres."
        );

        return;

    }


    /* =====================================================
       VALIDAR ROL
    ===================================================== */

    if (!rol_id) {

        mostrarMensaje(
            "Selecciona un rol."
        );

        return;

    }


    /* =====================================================
       VALIDAR ROL EXISTENTE
    ===================================================== */

    const rolSeleccionado =
        NEWSROOM_ROLES.find(
            function (rol) {

                return Number(
                    rol.id
                ) ===
                Number(
                    rol_id
                );

            }
        );


    if (!rolSeleccionado) {

        mostrarMensaje(
            "El rol seleccionado no es válido."
        );

        return;

    }


    /* =====================================================
       DESHABILITAR BOTÓN
    ===================================================== */

    if (guardarButton) {

        guardarButton.disabled =
            true;


        guardarButton.textContent =
            "Creando usuario...";

    }


    try {


        /* =================================================
           VERIFICAR AUTH SECUNDARIA
        ================================================= */

        if (
            !newsroomSecondaryAuth
        ) {

            throw new Error(
                "Firebase Authentication secundaria no está disponible."
            );

        }


        console.log(
            "Newsroom Portal: creando cuenta en Firebase Authentication..."
        );


        /* =================================================
           CREAR CUENTA EN AUTH SECUNDARIA
        ================================================= */

        const resultadoAuth =
            await newsroomSecondaryAuth
                .createUserWithEmailAndPassword(
                    correo,
                    password
                );


        const nuevoUsuario =
            resultadoAuth.user;


        if (!nuevoUsuario) {

            throw new Error(
                "Firebase no devolvió el usuario creado."
            );

        }


        const uid =
            nuevoUsuario.uid;


        console.log(
            "Newsroom Portal: usuario creado en Authentication.",
            uid
        );


        /* =================================================
           GUARDAR PERFIL EN FIRESTORE
        ================================================= */

        console.log(
            "Newsroom Portal: guardando perfil en Firestore..."
        );


        await newsroomDB
            .collection(
                "usuarios"
            )
            .doc(
                uid
            )
            .set({

                uid:
                    uid,

                nombre:
                    nombre,

                usuario:
                    usuario,

                correo:
                    correo,

                rol_id:
                    rol_id,

                rol_nombre:
                    rolSeleccionado.nombre,

                estado:
                    "Activo",

                fecha_creacion:
                    firebase.firestore.FieldValue.serverTimestamp(),

                creado_por:
                    obtenerIdentificadorAdministrador()

            });


        console.log(
            "Newsroom Portal: perfil guardado correctamente en Firestore."
        );


        /* =================================================
           CERRAR SESIÓN SECUNDARIA
           
           MUY IMPORTANTE:
           Esto NO cierra la sesión del administrador.
        ================================================= */

        try {

            await newsroomSecondaryAuth.signOut();

        }
        catch (signOutError) {

            console.warn(
                "Newsroom Portal: no fue posible cerrar Auth secundaria.",
                signOutError
            );

        }


        /* =================================================
           ÉXITO
        ================================================= */

        mostrarMensaje(
            "Usuario creado correctamente. Regresando a Administración...",
            "success"
        );


        /* =================================================
           LIMPIAR FORMULARIO
        ================================================= */

        const form =
            document.getElementById(
                "nuevoUsuarioForm"
            );


        if (form) {

            form.reset();

        }


        /* =================================================
           REGRESAR AL LISTADO
        ================================================= */

        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            1200
        );

    }
    catch (error) {

        console.error(
            "Newsroom Portal: error creando usuario.",
            error
        );


        /* =================================================
           TRADUCIR ERRORES DE FIREBASE
        ================================================= */

        let mensaje =
            "No fue posible crear el usuario.";


        if (
            error &&
            error.code
        ) {

            switch (
                error.code
            ) {

                case "auth/email-already-in-use":

                    mensaje =
                        "El correo electrónico ya está registrado en Firebase Authentication.";

                    break;


                case "auth/invalid-email":

                    mensaje =
                        "El correo electrónico no es válido.";

                    break;


                case "auth/weak-password":

                    mensaje =
                        "La contraseña es demasiado débil. Utiliza al menos 6 caracteres.";

                    break;


                case "auth/operation-not-allowed":

                    mensaje =
                        "El método de acceso mediante correo y contraseña no está habilitado en Firebase Authentication.";

                    break;


                case "permission-denied":

                    mensaje =
                        "Firebase rechazó el acceso a Firestore. Revisa las reglas de seguridad.";

                    break;


                case "failed-precondition":

                    mensaje =
                        "No se pudo completar la operación en Firestore.";

                    break;


                default:

                    if (
                        error.message
                    ) {

                        mensaje =
                            error.message;

                    }

                    break;

            }

        }
        else if (
            error &&
            error.message
        ) {

            mensaje =
                error.message;

        }


        mostrarMensaje(
            mensaje
        );


        /* =================================================
           REACTIVAR BOTÓN
        ================================================= */

        if (guardarButton) {

            guardarButton.disabled =
                false;


            guardarButton.textContent =
                "Guardar Usuario";

        }

    }

}


/* =========================================================
   OBTENER IDENTIFICADOR DEL ADMINISTRADOR
========================================================= */

function obtenerIdentificadorAdministrador() {

    try {

        const session =
            typeof obtenerSesion === "function"
                ? obtenerSesion()
                : null;


        if (!session) {

            return "Administrador";

        }


        return (
            session.nombre ||
            session.usuario ||
            session.email ||
            "Administrador"
        );

    }
    catch (error) {

        console.warn(
            "Newsroom Portal: no fue posible identificar al administrador.",
            error
        );


        return "Administrador";

    }

}


/* =========================================================
   MOSTRAR MENSAJE
========================================================= */

function mostrarMensaje(
    texto,
    tipo = "error"
) {

    const message =
        document.getElementById(
            "formMessage"
        );


    if (!message) {

        return;

    }


    message.textContent =
        texto;


    message.className =
        `form-message ${tipo}`;


    message.style.display =
        "block";

}


/* =========================================================
   OCULTAR MENSAJE
========================================================= */

function ocultarMensaje() {

    const message =
        document.getElementById(
            "formMessage"
        );


    if (!message) {

        return;

    }


    message.textContent =
        "";


    message.className =
        "form-message";


    message.style.display =
        "none";

}
