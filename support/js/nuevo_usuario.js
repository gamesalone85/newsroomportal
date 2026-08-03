/* =========================================================
NEWSROOM PORTAL
CREAR USUARIO
FIREBASE AUTH + FIRESTORE
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

console.log(
    "Newsroom Portal: nuevo_usuario.js cargado correctamente."
);


/* =====================================================
   VERIFICAR FIREBASE
===================================================== */

if (typeof firebase === "undefined") {

    console.error(
        "Newsroom Portal: Firebase no está disponible."
    );

    mostrarMensajeGlobal(
        "Firebase no está disponible.",
        "error"
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

    mostrarMensajeGlobal(
        "Los servicios de Firebase no están disponibles.",
        "error"
    );

    return;
}


console.log(
    "Newsroom Portal: Firebase Auth y Firestore disponibles."
);


/* =====================================================
   VERIFICAR SESIÓN
===================================================== */

if (typeof verificarSesion !== "function") {

    console.error(
        "Newsroom Portal: verificarSesion() no está disponible."
    );

    return;
}


if (!verificarSesion("../../login.html")) {

    return;
}


/* =====================================================
   OBTENER SESIÓN
===================================================== */

if (typeof obtenerSesion !== "function") {

    console.error(
        "Newsroom Portal: obtenerSesion() no está disponible."
    );

    return;
}


const session = obtenerSesion();


if (!session) {

    console.error(
        "Newsroom Portal: no existe una sesión activa."
    );

    window.location.href =
        "../../login.html";

    return;
}


/* =====================================================
   VALIDAR PERMISOS
   
   1 = Administrador
   4 = Rooms Admin
===================================================== */

const rolActual =
    Number(session.rol_id);


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
   ACTUALIZAR USUARIO ACTUAL
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
   SUBMIT
===================================================== */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        ocultarMensaje(
            message
        );


        /* =============================================
           OBTENER DATOS
        ============================================= */

        const nombre =
            document
                .getElementById("nombre")
                .value
                .trim();


        const usuario =
            document
                .getElementById("usuario")
                .value
                .trim();


        const correo =
            document
                .getElementById("correo")
                .value
                .trim()
                .toLowerCase();


        const password =
            document
                .getElementById("password")
                .value;


        const rol_id =
            Number(
                document
                    .getElementById("rol_id")
                    .value
            );


        /* =============================================
           VALIDACIONES
        ============================================= */

        if (!nombre) {

            mostrarMensaje(
                message,
                "Escribe el nombre completo del usuario.",
                "error"
            );

            return;
        }


        if (!usuario) {

            mostrarMensaje(
                message,
                "Escribe el nombre de usuario.",
                "error"
            );

            return;
        }


        if (!correo) {

            mostrarMensaje(
                message,
                "Escribe el correo electrónico.",
                "error"
            );

            return;
        }


        if (!password || password.length < 6) {

            mostrarMensaje(
                message,
                "La contraseña debe tener al menos 6 caracteres.",
                "error"
            );

            return;
        }


        if (!rol_id) {

            mostrarMensaje(
                message,
                "Selecciona un rol.",
                "error"
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
               VERIFICAR CORREO EN FIRESTORE
            ========================================= */

            console.log(
                "Newsroom Portal: verificando correo..."
            );


            const correoSnapshot =
                await newsroomDB
                    .collection("usuarios")
                    .where(
                        "correo",
                        "==",
                        correo
                    )
                    .limit(1)
                    .get();


            if (!correoSnapshot.empty) {

                throw new Error(
                    "Ya existe un usuario registrado con ese correo."
                );
            }


            /* =========================================
               VERIFICAR USUARIO
            ========================================= */

            console.log(
                "Newsroom Portal: verificando nombre de usuario..."
            );


            const usuarioSnapshot =
                await newsroomDB
                    .collection("usuarios")
                    .where(
                        "usuario",
                        "==",
                        usuario
                    )
                    .limit(1)
                    .get();


            if (!usuarioSnapshot.empty) {

                throw new Error(
                    "El nombre de usuario ya está registrado."
                );
            }


            /* =========================================
               AUTH SECUNDARIA
            ========================================= */

            if (
                typeof newsroomSecondaryAuth ===
                "undefined"
            ) {

                throw new Error(
                    "Firebase Authentication secundaria no está disponible."
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


            const usuarioAuth =
                credencial.user;


            if (!usuarioAuth) {

                throw new Error(
                    "Firebase no devolvió el usuario creado."
                );
            }


            console.log(
                "Newsroom Portal: cuenta Auth creada:",
                usuarioAuth.uid
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
               CREAR DOCUMENTO USUARIO
            ========================================= */

            const usuarioData = {

                uid:
                    usuarioAuth.uid,

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
                "Newsroom Portal: guardando usuario en Firestore..."
            );


            await newsroomDB
                .collection("usuarios")
                .doc(
                    usuarioAuth.uid
                )
                .set(
                    usuarioData
                );


            console.log(
                "Newsroom Portal: usuario guardado correctamente."
            );


            /* =========================================
               CERRAR AUTH SECUNDARIA
            ========================================= */

            try {

                await newsroomSecondaryAuth
                    .signOut();

                console.log(
                    "Newsroom Portal: Auth secundaria cerrada."
                );

            }
            catch (signOutError) {

                console.warn(
                    "Newsroom Portal: no se pudo cerrar Auth secundaria.",
                    signOutError
                );
            }


            /* =========================================
               LIMPIAR FORMULARIO
            ========================================= */

            form.reset();


            /* =========================================
               ÉXITO
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


            const mensaje =
                convertirErrorFirebase(
                    error
                );


            mostrarMensaje(
                message,
                mensaje,
                "error"
            );


            if (guardarButton) {

                guardarButton.disabled =
                    false;

                guardarButton.innerHTML =
                    '<i class="fa-solid fa-user-plus"></i> Guardar Usuario';
            }

        }

    }
);


});

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


}

/* =========================================================
CARGAR ROLES
========================================================= */

async function cargarRoles(
select
) {


if (!select) {

    return;
}


console.log(
    "Newsroom Portal: cargando roles..."
);


/* =====================================================
   OPCIÓN 1
   Firestore
===================================================== */

try {

    const snapshot =
        await newsroomDB
            .collection("roles")
            .get();


    select.innerHTML =
        '<option value="">Selecciona un rol</option>';


    if (!snapshot.empty) {

        const roles = [];


        snapshot.forEach(
            function (doc) {

                const data =
                    doc.data();


                roles.push({

                    id:
                        data.id !== undefined
                            ? data.id
                            : Number(doc.id),

                    nombre:
                        data.nombre ||
                        data.name ||
                        "Rol"

                });

            }
        );


        roles.sort(
            function (a, b) {

                return Number(a.id) -
                    Number(b.id);

            }
        );


        roles.forEach(
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


        console.log(
            "Newsroom Portal: roles cargados desde Firestore:",
            roles
        );


        return;
    }

}
catch (error) {

    console.warn(
        "Newsroom Portal: no fue posible cargar roles desde Firestore.",
        error
    );
}


/* =====================================================
   OPCIÓN 2
   NEWSROOM_ROLES COMO RESPALDO
===================================================== */

if (
    typeof NEWSROOM_ROLES !== "undefined" &&
    Array.isArray(NEWSROOM_ROLES)
) {

    select.innerHTML =
        '<option value="">Selecciona un rol</option>';


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


    console.log(
        "Newsroom Portal: roles cargados desde NEWSROOM_ROLES."
    );


    return;
}


/* =====================================================
   SIN ROLES
===================================================== */

select.innerHTML =
    '<option value="">No hay roles disponibles</option>';


console.error(
    "Newsroom Portal: NEWSROOM_ROLES no está disponible y Firestore no devolvió roles."
);


}

/* =========================================================
MOSTRAR MENSAJE
========================================================= */

function mostrarMensaje(
elemento,
texto,
tipo
) {

if (!elemento) {

    return;
}


elemento.textContent =
    texto;


elemento.className =
    "form-message " +
    (
        tipo ||
        "error"
    );


elemento.style.display =
    "block";


}

/* =========================================================
OCULTAR MENSAJE
========================================================= */

function ocultarMensaje(
elemento
) {


if (!elemento) {

    return;
}


elemento.textContent =
    "";


elemento.style.display =
    "none";


}

/* =========================================================
MENSAJE GLOBAL
========================================================= */

function mostrarMensajeGlobal(
texto,
tipo
) {


const elemento =
    document.getElementById(
        "formMessage"
    );


mostrarMensaje(
    elemento,
    texto,
    tipo || "error"
);


}

/* =========================================================
ERRORES FIREBASE
========================================================= */

function convertirErrorFirebase(
error
) {


if (!error) {

    return "Ocurrió un error desconocido.";
}


if (
    error.message &&
    !error.code
) {

    return error.message;
}


switch (error.code) {

    case "auth/email-already-in-use":

        return "El correo electrónico ya está registrado en Firebase Authentication.";


    case "auth/invalid-email":

        return "El correo electrónico no tiene un formato válido.";


    case "auth/weak-password":

        return "La contraseña es demasiado débil. Utiliza al menos 6 caracteres.";


    case "auth/operation-not-allowed":

        return "El acceso mediante correo y contraseña no está habilitado en Firebase Authentication.";


    case "auth/network-request-failed":

        return "No fue posible comunicarse con Firebase. Verifica tu conexión a Internet.";


    case "permission-denied":

        return "Firebase Firestore rechazó la operación por permisos insuficientes.";


    case "failed-precondition":

        return "Firestore requiere una configuración adicional para realizar esta operación.";


    default:

        return (
            error.message ||
            "No fue posible crear el usuario."
        );
}
}
