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
        ================================================== */

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
        ================================================== */

        const session =
            typeof obtenerSesion === "function"
                ? obtenerSesion()
                : null;


        if (!session) {

            console.error(
                "Newsroom Portal: no existe sesión."
            );

            return;

        }


        /* =================================================
           VALIDAR ROL
           
           1 = Administrador
           4 = Rooms Admin
        ================================================== */

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
                "newsroomAuth o newsroomDB no disponibles."
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

            return;

        }


        /* =================================================
           CARGAR ROLES
        ================================================= */

        cargarRoles(
            rolSelect
        );


        /* =================================================
           FORMULARIO
        ================================================= */

        if (form) {

            form.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    ocultarMensaje();


                    /* =====================================
                       DATOS
                    ===================================== */

                    const nombre =
                        document
                            .getElementById("nombre")
                            ?.value
                            .trim();


                    const usuario =
                        document
                            .getElementById("usuario")
                            ?.value
                            .trim();


                    const correo =
                        document
                            .getElementById("correo")
                            ?.value
                            .trim()
                            .toLowerCase();


                    const password =
                        document
                            .getElementById("password")
                            ?.value;


                    const rol_id =
                        Number(
                            document
                                .getElementById("rol_id")
                                ?.value
                        );


                    /* =====================================
                       VALIDACIONES
                    ===================================== */

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
                            "Escribe el correo electrónico del usuario."
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


                    /* =====================================
                       VALIDAR EMAIL
                    ===================================== */

                    const emailValido =
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                    if (
                        !emailValido.test(
                            correo
                        )
                    ) {

                        mostrarMensaje(
                            "Escribe un correo electrónico válido."
                        );

                        return;

                    }


                    /* =====================================
                       DESACTIVAR BOTÓN
                    ===================================== */

                    if (guardarButton) {

                        guardarButton.disabled =
                            true;


                        guardarButton.innerHTML =

                            '<i class="fa-solid fa-spinner fa-spin"></i> ' +
                            'Creando usuario...';

                    }


                    try {

                        /* =================================
                           VERIFICAR DUPLICADO DE USUARIO
                        ================================= */

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


                        /* =================================
                           CREAR CUENTA EN FIREBASE AUTH
                           
                           IMPORTANTE:
                           Se usa la instancia secundaria.
                           
                           El administrador NO pierde
                           su sesión actual.
                        ================================= */

                        console.log(
                            "Newsroom Portal: creando cuenta Firebase Auth..."
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
                            "Newsroom Portal: usuario Auth creado:",
                            uid
                        );


                        /* =================================
                           DATOS DEL ROL
                        ================================= */

                        let nombreRol =
                            "";


                        if (
                            typeof NEWSROOM_ROLES !==
                            "undefined" &&
                            Array.isArray(
                                NEWSROOM_ROLES
                            )
                        {

                            const rolEncontrado =
                                NEWSROOM_ROLES.find(
                                    item =>
                                        Number(
                                            item.id
                                        ) ===
                                        rol_id
                                );


                            if (
                                rolEncontrado
                            ) {

                                nombreRol =
                                    rolEncontrado.nombre ||
                                    "";

                            }

                        }


                        /* =================================
                           CREAR PERFIL EN FIRESTORE
                           
                           NO se guarda password.
                        ================================= */

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
                            "Newsroom Portal: usuario guardado correctamente en Firestore."
                        );


                        /* =================================
                           LIMPIAR CONTRASEÑA DE FORMULARIO
                        ================================= */

                        const passwordInput =
                            document.getElementById(
                                "password"
                            );


                        if (passwordInput) {

                            passwordInput.value =
                                "";

                        }


                        /* =================================
                           LIMPIAR FORMULARIO
                        ================================= */

                        form.reset();


                        /* =================================
                           MENSAJE
                        ================================= */

                        mostrarMensaje(

                            "Usuario creado correctamente en Firebase Authentication y Firestore. Regresando a Administración...",

                            "success"

                        );


                        /* =================================
                           REGRESAR
                        ================================= */

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


                        /* =================================
                           MENSAJES FIREBASE
                        ================================= */

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
                                    "El acceso mediante correo y contraseña no está habilitado en Firebase Authentication.";

                                break;


                            case "permission-denied":

                                mensaje =
                                    "Firebase rechazó la escritura en Firestore. Revisa las reglas de seguridad.";

                                break;


                            case "failed-precondition":

                                mensaje =
                                    "Firestore requiere una configuración adicional para realizar esta operación.";

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


                        /* =================================
                           RESTAURAR BOTÓN
                        ================================= */

                        if (guardarButton) {

                            guardarButton.disabled =
                                false;


                            guardarButton.innerHTML =

                                '<i class="fa-solid fa-user-plus"></i> ' +
                                'Guardar Usuario';

                        }

                    }

                }
            );

        }


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


    message.style.display =
        "none";

}
