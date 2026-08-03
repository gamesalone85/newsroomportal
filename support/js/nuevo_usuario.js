/* =========================================================
NEWSROOM PORTAL
CREAR USUARIO
FIREBASE AUTH + FIRESTORE
========================================================= */

document.addEventListener(
"DOMContentLoaded",
async function () {


    console.log(
        "Newsroom Portal: nuevo_usuario.js cargado correctamente."
    );


    /* =====================================================
       VERIFICAR FIREBASE
    ===================================================== */

    if (
        typeof firebase === "undefined"
    ) {

        console.error(
            "Newsroom Portal: Firebase no está disponible."
        );

        mostrarMensajeGlobal(
            "Firebase no está disponible. Verifica la configuración.",
            "error"
        );

        return;

    }


    if (
        typeof newsroomDB === "undefined" ||
        typeof newsroomAuth === "undefined"
    ) {

        console.error(
            "Newsroom Portal: Firestore o Authentication no están disponibles."
        );

        mostrarMensajeGlobal(
            "Los servicios de Firebase no están disponibles.",
            "error"
        );

        return;

    }


    console.log(
        "Newsroom Portal: Firebase disponible."
    );


    /* =====================================================
       VALIDAR SESIÓN
    ===================================================== */

    if (
        typeof verificarSesion !== "function"
    ) {

        console.error(
            "Newsroom Portal: verificarSesion() no está disponible."
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


    /* =====================================================
       OBTENER SESIÓN
    ===================================================== */

    if (
        typeof obtenerSesion !== "function"
    ) {

        console.error(
            "Newsroom Portal: obtenerSesion() no está disponible."
        );

        return;

    }


    const session =
        obtenerSesion();


    if (!session) {

        console.error(
            "Newsroom Portal: no existe una sesión activa."
        );

        window.location.href =
            "../../login.html";

        return;

    }


    /* =====================================================
       VALIDAR ROL
       
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
       ACTUALIZAR INFORMACIÓN DEL ADMIN
    ===================================================== */

    actualizarUsuarioActual(
        session
    );


    /* =====================================================
       ELEMENTOS
    ===================================================== */

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


    if (!form) {

        console.error(
            "Newsroom Portal: no existe #nuevoUsuarioForm."
        );

        return;

    }


    /* =====================================================
       CARGAR ROLES
    ===================================================== */

    await cargarRoles(
        rolSelect
    );


    /* =====================================================
       EVENTO FORMULARIO
    ===================================================== */

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            ocultarMensaje(
                message
            );


            /* =============================================
               DATOS
            ============================================= */

            const nombre =
                document
                    .getElementById(
                        "nombre"
                    )
                    .value
                    .trim();


            const usuario =
                document
                    .getElementById(
                        "usuario"
                    )
                    .value
                    .trim();


            const correo =
                document
                    .getElementById(
                        "correo"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById(
                        "password"
                    )
                    .value;


            const rol_id =
                Number(
                    document
                        .getElementById(
                            "rol_id"
                        )
                        .value
                );


            /* =============================================
               VALIDACIONES
            ============================================= */

            if (!nombre) {

                mostrarMensaje(
                    message,
                    "Escribe el nombre completo del usuario."
                );

                return;

            }


            if (!usuario) {

                mostrarMensaje(
                    message,
                    "Escribe el nombre de usuario."
                );

                return;

            }


            if (!correo) {

                mostrarMensaje(
                    message,
                    "Escribe el correo electrónico."
                );

                return;

            }


            if (!password || password.length < 6) {

                mostrarMensaje(
                    message,
                    "La contraseña debe tener al menos 6 caracteres."
                );

                return;

            }


            if (!rol_id) {

                mostrarMensaje(
                    message,
                    "Selecciona un rol."
                );

                return;

            }


            /* =============================================
               DESHABILITAR BOTÓN
            ============================================= */

            if (guardarButton) {

                guardarButton.disabled =
                    true;

                guardarButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Creando usuario...';

            }


            try {

                /* =========================================
                   VERIFICAR CORREO EXISTENTE EN FIRESTORE
                ========================================= */

                const usuariosExistentes =
                    await newsroomDB
                        .collection("usuarios")
                        .where(
                            "correo",
                            "==",
                            correo
                        )
                        .limit(1)
                        .get();


                if (
                    !usuariosExistentes.empty
                ) {

                    throw new Error(
                        "Ya existe un usuario registrado con ese correo."
                    );

                }


                /* =========================================
                   VERIFICAR NOMBRE DE USUARIO
                ========================================= */

                const usuarioExistente =
                    await newsroomDB
                        .collection("usuarios")
                        .where(
                            "usuario",
                            "==",
                            usuario
                        )
                        .limit(1)
                        .get();


                if (
                    !usuarioExistente.empty
                ) {

                    throw new Error(
                        "El nombre de usuario ya está registrado."
                    );

                }


                /* =========================================
                   CREAR CUENTA AUTH SECUNDARIA
                   
                   IMPORTANTE:
                   No utilizamos newsroomAuth directamente
                   porque eso modificaría la sesión del admin.
                ========================================= */

                if (
                    typeof newsroomSecondaryAuth ===
                    "undefined"
                ) {

                    throw new Error(
                        "Firebase Authentication secundaria no está configurada."
                    );

                }


                console.log(
                    "Newsroom Portal: creando cuenta en Firebase Authentication..."
                );


                const credencial =
                    await newsroomSecondaryAuth
                        .createUserWithEmailAndPassword(
                            correo,
                            password
                        );


                const nuevoUsuarioAuth =
                    credencial.user;


                if (!nuevoUsuarioAuth) {

                    throw new Error(
                        "Firebase no devolvió el usuario creado."
                    );

                }


                console.log(
                    "Newsroom Portal: usuario Auth creado:",
                    nuevoUsuarioAuth.uid
                );


                /* =========================================
                   OBTENER NOMBRE DEL ROL
                ========================================= */

                let nombreRol =
                    "Sin rol";


                if (rolSelect) {

                    const opcion =
                        rolSelect.options[
                            rolSelect.selectedIndex
                        ];


                    if (opcion) {

                        nombreRol =
                            opcion.textContent.trim();

                    }

                }


                /* =========================================
                   CREAR DOCUMENTO FIRESTORE
                ========================================= */

                const usuarioData = {

                    uid:
                        nuevoUsuarioAuth.uid,

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

                    fecha_creacion:
                        firebase.firestore.FieldValue.serverTimestamp(),

                    creado_por:
                        session.uid ||
                        session.usuario ||
                        session.correo ||
                        "administrador"

                };


                console.log(
                    "Newsroom Portal: guardando usuario en Firestore...",
                    usuarioData
                );


                await newsroomDB
                    .collection("usuarios")
                    .doc(
                        nuevoUsuarioAuth.uid
                    )
                    .set(
                        usuarioData
                    );


                console.log(
                    "Newsroom Portal: usuario guardado correctamente en Firestore."
                );


                /* =========================================
                   CERRAR SESIÓN SECUNDARIA
                ========================================= */

                try {

                    await newsroomSecondaryAuth
                        .signOut();

                }
                catch (errorSignOut) {

                    console.warn(
                        "Newsroom Portal: no se pudo cerrar Auth secundaria.",
                        errorSignOut
                    );

                }


                /* =========================================
                   LIMPIAR FORMULARIO
                ========================================= */

                form.reset();


                /* =========================================
                   MENSAJE ÉXITO
                ========================================= */

                mostrarMensaje(
                    message,
                    "Usuario creado correctamente. Regresando a Administración...",
                    "success"
                );


                /* =========================================
                   REGRESAR
                ========================================= */

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
                    "Newsroom Portal: error creando usuario:",
                    error
                );


                /* =========================================
                   MENSAJE FIREBASE
                ========================================= */

                let mensaje =
                    "No fue posible crear el usuario.";


                if (
                    error &&
                    error.message
                ) {

                    mensaje =
                        convertirErrorFirebase(
                            error
                        );

                }


                mostrarMensaje(
                    message,
                    mensaje,
                    "error"
                );


                /* =========================================
                   REACTIVAR BOTÓN
                ========================================= */

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
```

);

/* =========================================================
ACTUALIZAR USUARIO ACTUAL
========================================================= */

function actualizarUsuarioActual(
session
) {

```
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
    session.correo ||
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
```

}

/* =========================================================
CARGAR ROLES DESDE FIRESTORE
========================================================= */

async function cargarRoles(
select
) {

```
if (!select) {

    return;

}


try {

    console.log(
        "Newsroom Portal: cargando roles desde Firestore..."
    );


    const snapshot =
        await newsroomDB
            .collection("roles")
            .orderBy(
                "id",
                "asc"
            )
            .get();


    select.innerHTML =
        '<option value="">Selecciona un rol</option>';


    if (
        snapshot.empty
    ) {

        console.warn(
            "Newsroom Portal: la colección roles está vacía."
        );


        select.innerHTML +=
            '<option value="" disabled>No hay roles disponibles</option>';

        return;

    }


    snapshot.forEach(
        function (doc) {

            const data =
                doc.data();


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                data.id !== undefined
                    ? data.id
                    : doc.id;


            option.textContent =
                data.nombre ||
                data.name ||
                "Rol";


            select.appendChild(
                option
            );

        }
    );


    console.log(
        "Newsroom Portal: roles cargados:",
        select.options.length - 1
    );

}
catch (error) {

    console.error(
        "Newsroom Portal: error cargando roles:",
        error
    );


    select.innerHTML =
        '<option value="">No se pudieron cargar los roles</option>';

}
```

}

/* =========================================================
MOSTRAR MENSAJE
========================================================= */

function mostrarMensaje(
elemento,
texto,
tipo = "error"
) {

```
if (!elemento) {

    return;

}


elemento.textContent =
    texto;


elemento.className =
    `form-message ${tipo}`;


elemento.style.display =
    "block";
```

}

/* =========================================================
OCULTAR MENSAJE
========================================================= */

function ocultarMensaje(
elemento
) {

```
if (!elemento) {

    return;

}


elemento.textContent =
    "";


elemento.style.display =
    "none";
```

}

/* =========================================================
MENSAJE GLOBAL
========================================================= */

function mostrarMensajeGlobal(
texto,
tipo = "error"
) {

```
const elemento =
    document.getElementById(
        "formMessage"
    );


mostrarMensaje(
    elemento,
    texto,
    tipo
);
```

}

/* =========================================================
CONVERTIR ERROR FIREBASE
========================================================= */

function convertirErrorFirebase(
error
) {

```
const codigo =
    error &&
    error.code
        ? error.code
        : "";


switch (codigo) {

    case "auth/email-already-in-use":

        return "El correo electrónico ya está registrado en Firebase Authentication.";


    case "auth/invalid-email":

        return "El correo electrónico no tiene un formato válido.";


    case "auth/weak-password":

        return "La contraseña es demasiado débil. Utiliza al menos 6 caracteres.";


    case "auth/operation-not-allowed":

        return "El método de acceso por correo y contraseña no está habilitado en Firebase Authentication.";


    case "auth/network-request-failed":

        return "No fue posible comunicarse con Firebase. Verifica tu conexión a Internet.";


    case "permission-denied":

        return "Firebase Firestore rechazó la operación por permisos insuficientes.";


    case "failed-precondition":

        return "La operación de Firestore no pudo completarse debido a una configuración pendiente.";


    default:

        return (
            error.message ||
            "Ocurrió un error al crear el usuario."
        );

}

}
