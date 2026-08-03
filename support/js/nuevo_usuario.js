/* =========================================================
   NEWSROOM PORTAL
   CREAR USUARIO
   FIREBASE AUTHENTICATION + FIRESTORE
========================================================= */


/* =========================================================
   INICIALIZAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Newsroom Portal: nuevo_usuario.js cargado correctamente."
        );


        /* =================================================
           VALIDAR SESIÓN
        ================================================= */

        if (
            typeof verificarSesion !== "function"
        ) {

            console.error(
                "Newsroom Portal: auth.js no está disponible."
            );

            return;

        }


        if (
            !verificarSesion(
                "../../login.html"
            )
        ) {

            return;

        }


        /* =================================================
           OBTENER SESIÓN
        ================================================= */

        const session =
            typeof obtenerSesion === "function"
                ? obtenerSesion()
                : null;


        if (!session) {

            console.error(
                "Newsroom Portal: no existe una sesión activa."
            );

            return;

        }


        /* =================================================
           VALIDAR ROL
           
           1 = Administrador
           4 = Rooms Admin
        ================================================= */

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


        /* =================================================
           ACTUALIZAR USUARIO ACTUAL
        ================================================= */

        actualizarUsuarioActual(
            session
        );


        /* =================================================
           ELEMENTOS
        ================================================= */

        const form =
            document.getElementById(
                "nuevoUsuarioForm"
            );


        const rolSelect =
            document.getElementById(
                "rol_id"
            );


        const message =
            document.getElementById(
                "formMessage"
            );


        const guardarButton =
            document.getElementById(
                "guardarUsuario"
            );


        /* =================================================
           VERIFICAR FIREBASE
        ================================================= */

        if (
            typeof firebase === "undefined"
        ) {

            mostrarMensaje(
                "Firebase no está cargado. Verifica los scripts del HTML."
            );

            return;

        }


        if (
            typeof newsroomAuth === "undefined" ||
            typeof newsroomDB === "undefined"
        ) {

            mostrarMensaje(
                "Firebase no está correctamente inicializado."
            );

            console.error(
                "Newsroom Portal: newsroomAuth o newsroomDB no disponibles."
            );

            return;

        }


        if (
            typeof newsroomSecondaryAuth === "undefined" ||
            !newsroomSecondaryAuth
        ) {

            mostrarMensaje(
                "No se pudo inicializar el servicio de creación de usuarios."
            );

            console.error(
                "Newsroom Portal: newsroomSecondaryAuth no disponible."
            );

            return;

        }


        /* =================================================
           CARGAR ROLES
        ================================================= */

        cargarRoles(
            rolSelect
        );


        /* =================================================
           EVENTO FORMULARIO
        ================================================= */

        if (!form) {

            console.error(
                "Newsroom Portal: no existe #nuevoUsuarioForm."
            );

            return;

        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                ocultarMensaje();


                /* =========================================
                   OBTENER DATOS
                ========================================= */

                const nombreElement =
                    document.getElementById(
                        "nombre"
                    );


                const usuarioElement =
                    document.getElementById(
                        "usuario"
                    );


                const correoElement =
                    document.getElementById(
                        "correo"
                    );


                const passwordElement =
                    document.getElementById(
                        "password"
                    );


                const rolElement =
                    document.getElementById(
                        "rol_id"
                    );


                const nombre =
                    nombreElement
                        ? nombreElement.value.trim()
                        : "";


                const usuario =
                    usuarioElement
                        ? usuarioElement.value.trim()
                        : "";


                const correo =
                    correoElement
                        ? correoElement.value.trim().toLowerCase()
                        : "";


                const password =
                    passwordElement
                        ? passwordElement.value
                        : "";


                const rol_id =
                    rolElement
                        ? Number(
                            rolElement.value
                        )
                        : 0;


                /* =========================================
                   VALIDACIONES
                ========================================= */

                if (!nombre) {

                    mostrarMensaje(
                        "Escribe el nombre del usuario."
                    );

                    return;

                }


                if (!usuario) {

                    mostrarMensaje(
                        "Escribe el nombre de usuario."
                    );

                    return;

                }


                if (!correo) {

                    mostrarMensaje(
                        "Escribe el correo electrónico."
                    );

                    return;

                }


                if (!password) {

                    mostrarMensaje(
                        "Escribe una contraseña."
                    );

                    return;

                }


                if (
                    password.length < 6
                ) {

                    mostrarMensaje(
                        "La contraseña debe tener al menos 6 caracteres."
                    );

                    return;

                }


                if (!rol_id) {

                    mostrarMensaje(
                        "Selecciona un rol."
                    );

                    return;

                }


                /* =========================================
                   VALIDAR CORREO
                ========================================= */

                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailRegex.test(
                        correo
                    )
                ) {

                    mostrarMensaje(
                        "Escribe un correo electrónico válido."
                    );

                    return;

                }


                /* =========================================
                   DESACTIVAR BOTÓN
                ========================================= */

                if (guardarButton) {

                    guardarButton.disabled =
                        true;


                    guardarButton.innerHTML =
                        '<i class="fa-solid fa-spinner fa-spin"></i> Creando usuario...';

                }


                try {

                    console.log(
                        "Newsroom Portal: verificando usuario..."
                    );


                    /* =====================================
                       VERIFICAR USUARIO DUPLICADO
                    ===================================== */

                    const usuarioSnapshot =
                        await newsroomDB
                            .collection(
                                "usuarios"
                            )
                            .where(
                                "usuario",
                                "==",
                                usuario
                            )
                            .limit(1)
                            .get();


                    if (
                        !usuarioSnapshot.empty
                    ) {

                        throw new Error(
                            "Ya existe un usuario con ese nombre de usuario."
                        );

                    }


                    console.log(
                        "Newsroom Portal: usuario disponible."
                    );


                    /* =====================================
                       CREAR AUTH
                    ===================================== */

                    console.log(
                        "Newsroom Portal: creando cuenta en Firebase Authentication..."
                    );


                    const userCredential =
                        await newsroomSecondaryAuth
                            .createUserWithEmailAndPassword(
                                correo,
                                password
                            );


                    const firebaseUser =
                        userCredential.user;


                    if (!firebaseUser) {

                        throw new Error(
                            "Firebase no devolvió el usuario creado."
                        );

                    }


                    const uid =
                        firebaseUser.uid;


                    console.log(
                        "Newsroom Portal: cuenta Authentication creada.",
                        uid
                    );


                    /* =====================================
                       OBTENER NOMBRE DEL ROL
                    ===================================== */

                    let nombreRol =
                        "";


                    if (
                        typeof NEWSROOM_ROLES !==
                        "undefined" &&
                        Array.isArray(
                            NEWSROOM_ROLES
                        )
                    ) {

                        const rolEncontrado =
                            NEWSROOM_ROLES.find(
                                function (item) {

                                    return Number(
                                        item.id
                                    ) ===
                                    rol_id;

                                }
                            );


                        if (
                            rolEncontrado
                        ) {

                            nombreRol =
                                rolEncontrado.nombre ||
                                "";

                        }

                    }


                    /* =====================================
                       DATOS FIRESTORE
                       
                       IMPORTANTE:
                       NO SE GUARDA PASSWORD.
                    ===================================== */

                    const usuarioData = {

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

                        rol:
                            nombreRol,

                        activo:
                            true,

                        creado_en:
                            firebase.firestore.FieldValue.serverTimestamp(),

                        creado_por_uid:
                            newsroomAuth.currentUser
                                ? newsroomAuth.currentUser.uid
                                : null,

                        creado_por:
                            session.nombre ||
                            session.usuario ||
                            session.email ||
                            "Administrador"

                    };


                    console.log(
                        "Newsroom Portal: guardando perfil en Firestore..."
                    );


                    /* =====================================
                       CREAR DOCUMENTO
                    ===================================== */

                    await newsroomDB
                        .collection(
                            "usuarios"
                        )
                        .doc(
                            uid
                        )
                        .set(
                            usuarioData
                        );


                    console.log(
                        "Newsroom Portal: perfil guardado correctamente."
                    );


                    /* =====================================
                       LIMPIAR FORMULARIO
                    ===================================== */

                    form.reset();


                    /* =====================================
                       MENSAJE ÉXITO
                    ===================================== */

                    mostrarMensaje(

                        "Usuario creado correctamente en Firebase Authentication y Firestore.",

                        "success"

                    );


                    /* =====================================
                       REGRESAR
                    ===================================== */

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


                    /* =====================================
                       MENSAJE
                    ===================================== */

                    let mensaje =
                        "No fue posible crear el usuario.";


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
                                "El método Correo electrónico/Contraseña no está habilitado en Firebase Authentication.";

                            break;


                        case "permission-denied":

                            mensaje =
                                "Firebase rechazó la operación en Firestore. Revisa las reglas de seguridad.";

                            break;


                        default:

                            if (
                                error.message
                            ) {

                                mensaje =
                                    error.message;

                            }

                    }


                    mostrarMensaje(
                        mensaje
                    );


                    /* =====================================
                       RESTAURAR BOTÓN
                    ===================================== */

                    if (guardarButton) {

                        guardarButton.disabled =
                            false;


                        guardarButton.innerHTML =
                            '<i class="fa-solid fa-user-plus"></i> Guardar Usuario';

                    }

                }

            }
        );

    }
);


/* =========================================================
   ACTUALIZAR USUARIO ACTUAL
========================================================= */

function actualizarUsuarioActual(
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

function cargarRoles(
    select
) {

    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            Selecciona un rol
        </option>

    `;


    if (
        typeof NEWSROOM_ROLES ===
        "undefined"
    ) {

        console.warn(
            "Newsroom Portal: NEWSROOM_ROLES no está disponible."
        );

        return;

    }


    if (
        !Array.isArray(
            NEWSROOM_ROLES
        )
    ) {

        return;

    }


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


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   MOSTRAR MENSAJE
========================================================= */

function mostrarMensaje(
    texto,
    tipo
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
        tipo
            ? "form-message " + tipo
            : "form-message error";


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


    message.style.display =
        "none";

}
