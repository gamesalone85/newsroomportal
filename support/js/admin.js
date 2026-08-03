/* =========================================================
   NEWSROOM PORTAL
   ADMINISTRACIÓN DE USUARIOS
   FIREBASE AUTHENTICATION / FIRESTORE
========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const NEWSROOM_USERS_COLLECTION = "usuarios";

const NEWSROOM_SECONDARY_APP_NAME =
    "NewsroomSecondaryAuth";


/* =========================================================
   ESTADO LOCAL
========================================================= */

let newsroomUsuarios = [];

let newsroomSecondaryAuth = null;


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Newsroom Portal: admin.js Firebase cargado correctamente."
        );


        /* =====================================================
           VERIFICAR FIRESTORE
        ===================================================== */

        if (typeof newsroomDB === "undefined") {

            console.error(
                "Newsroom Portal: Firestore no está disponible."
            );

            mostrarErrorGeneral(
                "No fue posible conectar con Firebase."
            );

            return;
        }


        /* =====================================================
           VERIFICAR FIREBASE
        ===================================================== */

        if (typeof firebase === "undefined") {

            console.error(
                "Newsroom Portal: Firebase no está disponible."
            );

            mostrarErrorGeneral(
                "Firebase no está disponible."
            );

            return;
        }


        /* =====================================================
           VERIFICAR SESIÓN
        ===================================================== */

        if (
            typeof verificarSesion ===
            "function"
        ) {

            const sesionValida =
                verificarSesion(
                    "../../login.html"
                );


            if (!sesionValida) {

                return;
            }

        }
        else {

            console.error(
                "Newsroom Portal: auth.js no está disponible."
            );

            return;
        }


        /* =====================================================
           OBTENER SESIÓN
        ===================================================== */

        const session =
            typeof obtenerSesion ===
            "function"

                ? obtenerSesion()

                : null;


        if (!session) {

            console.error(
                "Newsroom Portal: no existe sesión."
            );

            return;
        }


        /* =====================================================
           VERIFICAR ADMINISTRADOR
        ===================================================== */

        if (
            Number(session.rol_id) !==
            1
        ) {

            alert(
                "No tienes permisos para acceder a esta sección."
            );


            window.location.href =
                "../dashboard/index.html";


            return;
        }


        /* =====================================================
           PREPARAR AUTH SECUNDARIA
        ===================================================== */

        inicializarAuthSecundaria();


        /* =====================================================
           ACTUALIZAR INFORMACIÓN DEL USUARIO
        ===================================================== */

        actualizarUsuario();


        /* =====================================================
           CONFIGURAR EVENTOS
        ===================================================== */

        configurarEventos();


        /* =====================================================
           CARGAR USUARIOS
        ===================================================== */

        await cargarUsuarios();


        console.log(
            "Newsroom Portal: administración inicializada correctamente."
        );

    }
);


/* =========================================================
   FIREBASE AUTH SECUNDARIA
========================================================= */

function inicializarAuthSecundaria() {

    try {

        /*
         * Si ya existe una instancia secundaria,
         * la reutilizamos.
         */

        newsroomSecondaryAuth =
            firebase
                .app(
                    NEWSROOM_SECONDARY_APP_NAME
                )
                .auth();


        console.log(
            "Newsroom Portal: Auth secundaria reutilizada."
        );


        return;

    }
    catch (error) {

        /*
         * La aplicación secundaria todavía
         * no existe.
         */

        console.log(
            "Newsroom Portal: creando Auth secundaria..."
        );

    }


    try {

        /*
         * firebaseConfig debe estar definido
         * por firebase-config.js
         */

        if (
            typeof firebaseConfig ===
            "undefined"
        ) {

            console.error(
                "Newsroom Portal: firebaseConfig no está disponible."
            );

            return;
        }


        const secondaryApp =
            firebase.initializeApp(
                firebaseConfig,
                NEWSROOM_SECONDARY_APP_NAME
            );


        newsroomSecondaryAuth =
            secondaryApp.auth();


        console.log(
            "Newsroom Portal: Auth secundaria creada correctamente."
        );

    }
    catch (error) {

        console.error(
            "Newsroom Portal: error creando Auth secundaria:",
            error
        );

    }
}


/* =========================================================
   CARGAR USUARIOS DESDE FIRESTORE
========================================================= */

async function cargarUsuarios() {

    console.log(
        "Newsroom Portal: cargando usuarios desde Firestore..."
    );


    const tbody =
        document.getElementById(
            "usuariosTableBody"
        );


    if (tbody) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    Cargando usuarios...
                </td>
            </tr>
        `;

    }


    try {

        const snapshot =
            await newsroomDB
                .collection(
                    NEWSROOM_USERS_COLLECTION
                )
                .get();


        newsroomUsuarios = [];


        snapshot.forEach(
            function (doc) {

                const data =
                    doc.data();


                /*
                 * UID
                 */

                const uid =
                    data.uid ||
                    doc.id;


                /*
                 * ROL
                 */

                const rolId =
                    Number(
                        data.rol_id ||
                        0
                    );


                const rolNombre =
                    data.rol_nombre ||
                    data.rol ||
                    obtenerNombreRol(
                        rolId
                    );


                newsroomUsuarios.push({

                    firestoreId:
                        doc.id,

                    uid:
                        uid,

                    id:
                        data.id ||
                        uid,

                    usuario:
                        data.usuario ||
                        "",

                    nombre:
                        data.nombre ||
                        "",

                    correo:
                        data.correo ||
                        "",

                    rol_id:
                        rolId,

                    rol:
                        rolNombre,

                    estado:
                        data.estado ||
                        "Activo"

                });

            }
        );


        /*
         * ORDENAR POR NOMBRE
         */

        newsroomUsuarios.sort(
            function (a, b) {

                return String(
                    a.nombre || ""
                ).localeCompare(
                    String(
                        b.nombre || ""
                    ),
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                );

            }
        );


        console.log(
            "Newsroom Portal: usuarios obtenidos:",
            newsroomUsuarios
        );


        console.log(
            "Newsroom Portal: total de usuarios:",
            newsroomUsuarios.length
        );


        renderizarUsuarios();


        actualizarKPIs();

    }
    catch (error) {

        console.error(
            "Newsroom Portal: error cargando usuarios:",
            error
        );


        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="text-align:center;"
                    >
                        No fue posible cargar los usuarios.
                    </td>
                </tr>
            `;

        }


        manejarErrorFirebase(
            error,
            "No fue posible cargar los usuarios."
        );

    }

}


/* =========================================================
   ACTUALIZAR USUARIO TOPBAR
========================================================= */

function actualizarUsuario() {

    let session = null;


    if (
        typeof obtenerSesion ===
        "function"
    ) {

        session =
            obtenerSesion();

    }


    if (!session) {

        return;
    }


    const nombre =
        session.nombre ||
        session.usuario ||
        "Administrador";


    const userName =
        document.getElementById(
            "userName"
        );


    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


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
   RENDERIZAR USUARIOS
========================================================= */

function renderizarUsuarios() {

    const tbody =
        document.getElementById(
            "usuariosTableBody"
        );


    if (!tbody) {

        console.warn(
            "Newsroom Portal: no se encontró usuariosTableBody."
        );

        return;
    }


    tbody.innerHTML = "";


    if (
        newsroomUsuarios.length ===
        0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    No existen usuarios registrados.
                </td>
            </tr>
        `;

        return;
    }


    newsroomUsuarios.forEach(
        function (usuario) {

            const tr =
                document.createElement(
                    "tr"
                );


            const rolClase =
                String(
                    usuario.rol || ""
                )
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            const estadoClase =
                String(
                    usuario.estado || ""
                )
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            let botonesEstado =
                "";


            /* =================================================
               SUSPENDER / ACTIVAR
            ================================================= */

            if (
                Number(
                    usuario.rol_id
                ) !== 1
            ) {

                if (
                    usuario.estado ===
                    "Activo"
                ) {

                    botonesEstado = `
                        <button
                            type="button"
                            class="btn-admin btn-suspend"
                            data-action="suspend"
                            data-id="${escapeHTML(usuario.firestoreId)}"
                        >
                            Suspender
                        </button>
                    `;

                }
                else {

                    botonesEstado = `
                        <button
                            type="button"
                            class="btn-admin btn-activate"
                            data-action="activate"
                            data-id="${escapeHTML(usuario.firestoreId)}"
                        >
                            Activar
                        </button>
                    `;

                }

            }


            /* =================================================
               ELIMINAR
            ================================================= */

            let botonEliminar =
                "";


            if (
                Number(
                    usuario.rol_id
                ) !== 1
            ) {

                botonEliminar = `
                    <button
                        type="button"
                        class="btn-admin btn-delete"
                        data-action="delete"
                        data-id="${escapeHTML(usuario.firestoreId)}"
                    >
                        Eliminar
                    </button>
                `;

            }


            /* =================================================
               FILA
            ================================================= */

            tr.innerHTML = `

                <td>
                    #${escapeHTML(usuario.id)}
                </td>

                <td>
                    ${escapeHTML(usuario.nombre)}
                </td>

                <td>
                    ${escapeHTML(usuario.usuario)}
                </td>

                <td>
                    ${escapeHTML(usuario.correo)}
                </td>

                <td>

                    <span
                        class="role-badge role-${escapeHTML(rolClase)}"
                    >
                        ${escapeHTML(usuario.rol)}
                    </span>

                </td>

                <td>

                    <span
                        class="status-badge status-${escapeHTML(estadoClase)}"
                    >
                        ${escapeHTML(usuario.estado)}
                    </span>

                </td>

                <td>

                    <div class="action-group">

                        <button
                            type="button"
                            class="btn-admin btn-edit"
                            data-action="edit"
                            data-id="${escapeHTML(usuario.firestoreId)}"
                        >
                            Editar
                        </button>


                        <button
                            type="button"
                            class="btn-admin btn-reset"
                            data-action="reset"
                            data-id="${escapeHTML(usuario.firestoreId)}"
                        >
                            Reset Password
                        </button>


                        ${botonesEstado}


                        ${botonEliminar}

                    </div>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   ACTUALIZAR KPIs
========================================================= */

function actualizarKPIs() {

    const total =
        newsroomUsuarios.length;


    const activos =
        newsroomUsuarios.filter(
            function (usuario) {

                return (
                    usuario.estado ===
                    "Activo"
                );

            }
        ).length;


    const suspendidos =
        newsroomUsuarios.filter(
            function (usuario) {

                return (
                    usuario.estado ===
                    "Suspendido"
                );

            }
        ).length;


    actualizarTexto(
        "totalUsuarios",
        total
    );


    actualizarTexto(
        "usuariosActivos",
        activos
    );


    actualizarTexto(
        "usuariosSuspendidos",
        suspendidos
    );

}


/* =========================================================
   ACTUALIZAR TEXTO
========================================================= */

function actualizarTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


/* =========================================================
   CONFIGURAR EVENTOS
========================================================= */

function configurarEventos() {

    console.log(
        "Newsroom Portal: configurando eventos..."
    );


    /* =====================================================
       NUEVO USUARIO
    ===================================================== */

    const nuevoUsuarioBtn =
        document.getElementById(
            "nuevoUsuarioBtn"
        );


    if (nuevoUsuarioBtn) {

        nuevoUsuarioBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                abrirModalUsuario();

            }
        );

    }


    /* =====================================================
       TABLA
    ===================================================== */

    const tbody =
        document.getElementById(
            "usuariosTableBody"
        );


    if (tbody) {

        tbody.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "button[data-action]"
                    );


                if (!button) {

                    return;
                }


                event.preventDefault();


                const action =
                    button.getAttribute(
                        "data-action"
                    );


                const firestoreId =
                    button.getAttribute(
                        "data-id"
                    );


                manejarAccionUsuario(
                    action,
                    firestoreId
                );

            }
        );

    }


    /* =====================================================
       CERRAR MODAL USUARIO
    ===================================================== */

    const cerrarModal =
        document.getElementById(
            "cerrarModal"
        );


    if (cerrarModal) {

        cerrarModal.addEventListener(
            "click",
            cerrarModalUsuario
        );

    }


    const cancelarUsuario =
        document.getElementById(
            "cancelarUsuario"
        );


    if (cancelarUsuario) {

        cancelarUsuario.addEventListener(
            "click",
            cerrarModalUsuario
        );

    }


    /* =====================================================
       FORMULARIO USUARIO
    ===================================================== */

    const usuarioForm =
        document.getElementById(
            "usuarioForm"
        );


    if (usuarioForm) {

        usuarioForm.addEventListener(
            "submit",
            guardarUsuario
        );

    }


    /* =====================================================
       PASSWORD MODAL
    ===================================================== */

    const cerrarPasswordModal =
        document.getElementById(
            "cerrarPasswordModal"
        );


    if (cerrarPasswordModal) {

        cerrarPasswordModal.addEventListener(
            "click",
            cerrarModalPassword
        );

    }


    const cancelarPassword =
        document.getElementById(
            "cancelarPassword"
        );


    if (cancelarPassword) {

        cancelarPassword.addEventListener(
            "click",
            cerrarModalPassword
        );

    }


    const passwordForm =
        document.getElementById(
            "passwordForm"
        );


    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            guardarPassword
        );

    }


    /* =====================================================
       CERRAR MODAL USUARIO FUERA
    ===================================================== */

    const usuarioModal =
        document.getElementById(
            "usuarioModal"
        );


    if (usuarioModal) {

        usuarioModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    usuarioModal
                ) {

                    cerrarModalUsuario();

                }

            }
        );

    }


    /* =====================================================
       CERRAR MODAL PASSWORD FUERA
    ===================================================== */

    const passwordModal =
        document.getElementById(
            "passwordModal"
        );


    if (passwordModal) {

        passwordModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    passwordModal
                ) {

                    cerrarModalPassword();

                }

            }
        );

    }

}


/* =========================================================
   MANEJAR ACCIONES
========================================================= */

function manejarAccionUsuario(
    action,
    firestoreId
) {

    const usuario =
        buscarUsuario(
            firestoreId
        );


    if (!usuario) {

        alert(
            "Usuario no encontrado."
        );

        return;
    }


    switch (action) {

        case "edit":

            abrirModalUsuario(
                usuario
            );

            break;


        case "reset":

            abrirModalPassword(
                usuario
            );

            break;


        case "suspend":

            cambiarEstado(
                usuario,
                "Suspendido"
            );

            break;


        case "activate":

            cambiarEstado(
                usuario,
                "Activo"
            );

            break;


        case "delete":

            eliminarUsuario(
                usuario
            );

            break;


        default:

            console.warn(
                "Acción desconocida:",
                action
            );

    }

}


/* =========================================================
   BUSCAR USUARIO
========================================================= */

function buscarUsuario(
    firestoreId
) {

    return newsroomUsuarios.find(
        function (usuario) {

            return (
                String(
                    usuario.firestoreId
                ) ===
                String(
                    firestoreId
                )
            );

        }
    );

}


/* =========================================================
   ABRIR MODAL USUARIO
========================================================= */

function abrirModalUsuario(
    usuario = null
) {

    const modal =
        document.getElementById(
            "usuarioModal"
        );


    if (!modal) {

        console.error(
            "No existe #usuarioModal."
        );

        return;
    }


    const title =
        document.getElementById(
            "modalTitle"
        );


    const id =
        document.getElementById(
            "usuarioId"
        );


    const nombre =
        document.getElementById(
            "nombre"
        );


    const usuarioInput =
        document.getElementById(
            "usuario"
        );


    const correo =
        document.getElementById(
            "correo"
        );


    const password =
        document.getElementById(
            "password"
        );


    const passwordGroup =
        document.getElementById(
            "passwordGroup"
        );


    const rol =
        document.getElementById(
            "rolId"
        );


    ocultarError(
        "formError"
    );


    if (usuario) {

        title.textContent =
            "Editar Usuario";


        id.value =
            usuario.firestoreId;


        nombre.value =
            usuario.nombre ||
            "";


        usuarioInput.value =
            usuario.usuario ||
            "";


        correo.value =
            usuario.correo ||
            "";


        rol.value =
            String(
                usuario.rol_id ||
                3
            );


        password.value =
            "";


        password.removeAttribute(
            "required"
        );


        if (passwordGroup) {

            passwordGroup.style.display =
                "none";

        }

    }
    else {

        title.textContent =
            "Nuevo Usuario";


        id.value =
            "";


        nombre.value =
            "";


        usuarioInput.value =
            "";


        correo.value =
            "";


        /*
         * Por defecto:
         * Usuario = 3
         */

        rol.value =
            "3";


        password.value =
            "";


        password.setAttribute(
            "required",
            "required"
        );


        if (passwordGroup) {

            passwordGroup.style.display =
                "";

        }

    }


    modal.style.display =
        "flex";


    modal.style.visibility =
        "visible";


    modal.style.opacity =
        "1";


    modal.style.position =
        "fixed";


    modal.style.top =
        "0";


    modal.style.left =
        "0";


    modal.style.width =
        "100vw";


    modal.style.height =
        "100vh";


    modal.style.zIndex =
        "99999";


    modal.style.backgroundColor =
        "rgba(0,0,0,0.75)";

}


/* =========================================================
   CERRAR MODAL USUARIO
========================================================= */

function cerrarModalUsuario() {

    const modal =
        document.getElementById(
            "usuarioModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================================
   GUARDAR USUARIO
========================================================= */

async function guardarUsuario(
    event
) {

    event.preventDefault();


    ocultarError(
        "formError"
    );


    const id =
        document.getElementById(
            "usuarioId"
        ).value.trim();


    const nombre =
        document.getElementById(
            "nombre"
        ).value.trim();


    const usuario =
        document.getElementById(
            "usuario"
        ).value.trim();


    const correo =
        document.getElementById(
            "correo"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


    const rolId =
        Number(
            document.getElementById(
                "rolId"
            ).value
        );


    /* =====================================================
       VALIDACIÓN
    ===================================================== */

    if (
        !nombre ||
        !usuario ||
        !correo
    ) {

        mostrarError(
            "formError",
            "Nombre, usuario y correo son obligatorios."
        );

        return;
    }


    if (
        !rolId ||
        ![1, 2, 3, 4].includes(
            rolId
        )
    ) {

        mostrarError(
            "formError",
            "El rol seleccionado no es válido."
        );

        return;
    }


    /* =====================================================
       VALIDAR USUARIO DUPLICADO
    ===================================================== */

    const duplicado =
        newsroomUsuarios.find(
            function (item) {

                return (

                    String(
                        item.usuario ||
                        ""
                    )
                        .trim()
                        .toLowerCase() ===
                    usuario
                        .trim()
                        .toLowerCase()

                    &&

                    String(
                        item.firestoreId
                    ) !==
                    String(id)

                );

            }
        );


    if (duplicado) {

        mostrarError(
            "formError",
            "El nombre de usuario ya existe."
        );

        return;
    }


    /* =====================================================
       EDITAR USUARIO EXISTENTE
    ===================================================== */

    if (id) {

        await actualizarUsuario(
            id,
            nombre,
            usuario,
            correo,
            rolId
        );

        return;
    }


    /* =====================================================
       CREAR NUEVO USUARIO
    ===================================================== */

    if (!password) {

        mostrarError(
            "formError",
            "La contraseña es obligatoria para crear un usuario."
        );

        return;
    }


    if (
        password.length <
        6
    ) {

        mostrarError(
            "formError",
            "La contraseña debe tener al menos 6 caracteres."
        );

        return;
    }


    await crearUsuarioFirebase(
        nombre,
        usuario,
        correo,
        password,
        rolId
    );

}


/* =========================================================
   CREAR USUARIO EN FIREBASE AUTHENTICATION
========================================================= */

async function crearUsuarioFirebase(
    nombre,
    usuario,
    correo,
    password,
    rolId
) {

    console.log(
        "Newsroom Portal: creando usuario en Firebase Authentication..."
    );


    if (!newsroomSecondaryAuth) {

        inicializarAuthSecundaria();

    }


    if (!newsroomSecondaryAuth) {

        mostrarError(
            "formError",
            "No fue posible inicializar Firebase Authentication."
        );

        return;
    }


    try {

        /*
         * CREAR CUENTA EN AUTH
         */

        const credential =
            await newsroomSecondaryAuth
                .createUserWithEmailAndPassword(
                    correo,
                    password
                );


        const user =
            credential.user;


        if (!user) {

            throw new Error(
                "Firebase no devolvió el usuario creado."
            );

        }


        const uid =
            user.uid;


        console.log(
            "Newsroom Portal: usuario creado en Auth:",
            uid
        );


        /* =================================================
           DATOS DEL USUARIO
        ================================================= */

        const rolNombre =
            obtenerNombreRol(
                rolId
            );


        const datosUsuario = {

            uid:
                uid,

            id:
                uid,

            nombre:
                nombre,

            usuario:
                usuario,

            correo:
                correo,

            rol_id:
                rolId,

            rol_nombre:
                rolNombre,

            estado:
                "Activo",

            creado_por:
                obtenerNombreAdministrador(),

            fecha_creacion:
                firebase.firestore.FieldValue
                    .serverTimestamp()

        };


        /* =================================================
           CREAR DOCUMENTO FIRESTORE
        ================================================= */

        await newsroomDB
            .collection(
                NEWSROOM_USERS_COLLECTION
            )
            .doc(uid)
            .set(
                datosUsuario
            );


        console.log(
            "Newsroom Portal: usuario guardado en Firestore:",
            uid
        );


        /*
         * CERRAR SESIÓN DE LA AUTH SECUNDARIA
         *
         * Esto NO afecta al administrador principal.
         */

        try {

            await newsroomSecondaryAuth
                .signOut();

        }
        catch (signOutError) {

            console.warn(
                "Newsroom Portal: no fue posible cerrar Auth secundaria:",
                signOutError
            );

        }


        cerrarModalUsuario();


        await cargarUsuarios();


        alert(
            "Usuario creado correctamente en Firebase Authentication y Firestore."
        );


    }
    catch (error) {

        console.error(
            "Newsroom Portal: error creando usuario:",
            error
        );


        /*
         * Si el usuario se creó en Auth pero
         * falló Firestore, intentamos cerrar
         * la sesión secundaria.
         */

        try {

            if (
                newsroomSecondaryAuth &&
                newsroomSecondaryAuth.currentUser
            ) {

                await newsroomSecondaryAuth
                    .signOut();

            }

        }
        catch (cleanupError) {

            console.warn(
                "Error limpiando Auth secundaria:",
                cleanupError
            );

        }


        manejarErrorCreacionUsuario(
            error
        );

    }

}


/* =========================================================
   ACTUALIZAR USUARIO EXISTENTE
========================================================= */

async function actualizarUsuarioFirestore(
    id,
    nombre,
    usuario,
    correo,
    rolId
) {

    try {

        await newsroomDB
            .collection(
                NEWSROOM_USERS_COLLECTION
            )
            .doc(id)
            .update({

                nombre:
                    nombre,

                usuario:
                    usuario,

                correo:
                    correo,

                rol_id:
                    rolId,

                rol_nombre:
                    obtenerNombreRol(
                        rolId
                    )

            });


        cerrarModalUsuario();


        await cargarUsuarios();


        alert(
            "Usuario actualizado correctamente."
        );


    }
    catch (error) {

        console.error(
            "Error actualizando usuario:",
            error
        );


        manejarErrorFirebase(
            error,
            "No fue posible actualizar el usuario."
        );

    }

}


/* =========================================================
   ACTUALIZAR USUARIO
========================================================= */

async function actualizarUsuario(
    id,
    nombre,
    usuario,
    correo,
    rolId
) {

    await actualizarUsuarioFirestore(
        id,
        nombre,
        usuario,
        correo,
        rolId
    );

}


/* =========================================================
   OBTENER NOMBRE DEL ADMINISTRADOR
========================================================= */

function obtenerNombreAdministrador() {

    if (
        typeof obtenerSesion ===
        "function"
    ) {

        const session =
            obtenerSesion();


        if (session) {

            return (
                session.nombre ||
                session.usuario ||
                "Administrador"
            );

        }

    }


    return "Administrador";
}


/* =========================================================
   NOMBRE DEL ROL
========================================================= */

function obtenerNombreRol(
    rolId
) {

    const roles = {

        1:
            "Administrador",

        2:
            "Soporte",

        3:
            "Usuario",

        4:
            "Rooms Admin"

    };


    return (
        roles[
            Number(rolId)
        ] ||
        "Usuario"
    );

}


/* =========================================================
   CAMBIAR ESTADO
========================================================= */

async function cambiarEstado(
    usuario,
    nuevoEstado
) {

    if (
        Number(
            usuario.rol_id
        ) === 1
    ) {

        alert(
            "El administrador principal no puede ser suspendido."
        );

        return;
    }


    const accion =
        nuevoEstado === "Activo"
            ? "activar"
            : "suspender";


    const confirmar =
        confirm(
            `¿Deseas ${accion} al usuario "${usuario.nombre}"?`
        );


    if (!confirmar) {

        return;
    }


    try {

        await newsroomDB
            .collection(
                NEWSROOM_USERS_COLLECTION
            )
            .doc(
                usuario.firestoreId
            )
            .update({

                estado:
                    nuevoEstado

            });


        await cargarUsuarios();


        alert(
            nuevoEstado === "Activo"

                ? "Usuario activado correctamente."

                : "Usuario suspendido correctamente."
        );

    }
    catch (error) {

        console.error(
            "Error cambiando estado:",
            error
        );


        manejarErrorFirebase(
            error,
            "No fue posible cambiar el estado del usuario."
        );

    }

}


/* =========================================================
   ELIMINAR USUARIO
========================================================= */

async function eliminarUsuario(
    usuario
) {

    if (
        Number(
            usuario.rol_id
        ) === 1
    ) {

        alert(
            "El administrador principal no puede eliminarse."
        );

        return;
    }


    const confirmar =
        confirm(
            `¿Eliminar definitivamente el perfil de "${usuario.nombre}"?`
        );


    if (!confirmar) {

        return;
    }


    try {

        /*
         * IMPORTANTE:
         *
         * Desde el navegador no podemos eliminar
         * directamente la cuenta de Firebase Auth
         * de otro usuario sin privilegios de Admin SDK.
         *
         * Por ahora eliminamos el perfil Firestore.
         */

        await newsroomDB
            .collection(
                NEWSROOM_USERS_COLLECTION
            )
            .doc(
                usuario.firestoreId
            )
            .delete();


        await cargarUsuarios();


        alert(
            "Perfil eliminado correctamente de Firestore."
        );


    }
    catch (error) {

        console.error(
            "Error eliminando usuario:",
            error
        );


        manejarErrorFirebase(
            error,
            "No fue posible eliminar el perfil."
        );

    }

}


/* =========================================================
   ABRIR MODAL PASSWORD
========================================================= */

function abrirModalPassword(
    usuario
) {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    if (!modal) {

        console.error(
            "No existe #passwordModal."
        );

        return;
    }


    const id =
        document.getElementById(
            "passwordUserId"
        );


    const nombre =
        document.getElementById(
            "passwordUserName"
        );


    const password =
        document.getElementById(
            "newPassword"
        );


    const confirmar =
        document.getElementById(
            "confirmPassword"
        );


    if (id) {

        id.value =
            usuario.firestoreId;

    }


    if (nombre) {

        nombre.textContent =
            usuario.nombre;

    }


    if (password) {

        password.value =
            "";

    }


    if (confirmar) {

        confirmar.value =
            "";

    }


    ocultarError(
        "passwordError"
    );


    modal.style.display =
        "flex";


    modal.style.visibility =
        "visible";


    modal.style.opacity =
        "1";


    modal.style.position =
        "fixed";


    modal.style.top =
        "0";


    modal.style.left =
        "0";


    modal.style.width =
        "100vw";


    modal.style.height =
        "100vh";


    modal.style.zIndex =
        "99999";


    modal.style.backgroundColor =
        "rgba(0,0,0,0.75)";

}


/* =========================================================
   CERRAR MODAL PASSWORD
========================================================= */

function cerrarModalPassword() {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================================
   GUARDAR PASSWORD
========================================================= */

async function guardarPassword(
    event
) {

    event.preventDefault();


    /*
     * El cambio de contraseña de otro usuario
     * requiere privilegios de Admin SDK.
     *
     * Lo implementaremos posteriormente mediante
     * Cloud Functions / Firebase Admin SDK.
     */

    mostrarError(
        "passwordError",
        "El restablecimiento administrativo de contraseñas se habilitará mediante Firebase Authentication Admin SDK."
    );

}


/* =========================================================
   MANEJO DE ERROR DE CREACIÓN
========================================================= */

function manejarErrorCreacionUsuario(
    error
) {

    console.error(
        "Firebase Authentication:",
        error
    );


    if (
        !error
    ) {

        mostrarError(
            "formError",
            "No fue posible crear el usuario."
        );

        return;
    }


    switch (
        error.code
    ) {

        case "auth/email-already-in-use":

            mostrarError(
                "formError",
                "El correo electrónico ya está registrado en Firebase Authentication."
            );

            break;


        case "auth/invalid-email":

            mostrarError(
                "formError",
                "El correo electrónico no es válido."
            );

            break;


        case "auth/weak-password":

            mostrarError(
                "formError",
                "La contraseña es demasiado débil. Utiliza al menos 6 caracteres."
            );

            break;


        case "auth/operation-not-allowed":

            mostrarError(
                "formError",
                "El método de autenticación por correo y contraseña no está habilitado en Firebase Authentication."
            );

            break;


        case "auth/network-request-failed":

            mostrarError(
                "formError",
                "No fue posible comunicarse con Firebase. Revisa tu conexión."
            );

            break;


        case "permission-denied":

        case "firestore/permission-denied":

            mostrarError(
                "formError",
                "El usuario se creó en Authentication, pero Firestore rechazó la creación del perfil por permisos."
            );

            break;


        default:

            mostrarError(
                "formError",
                error.message ||
                "No fue posible crear el usuario."
            );

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    valor
) {

    return String(
        valor ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   MOSTRAR ERROR
========================================================= */

function mostrarError(
    id,
    mensaje
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {

        alert(
            mensaje
        );

        return;
    }


    elemento.textContent =
        mensaje;


    elemento.style.display =
        "block";

}


/* =========================================================
   OCULTAR ERROR
========================================================= */

function ocultarError(
    id
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {

        return;
    }


    elemento.textContent =
        "";


    elemento.style.display =
        "none";

}


/* =========================================================
   ERROR GENERAL
========================================================= */

function mostrarErrorGeneral(
    mensaje
) {

    const tbody =
        document.getElementById(
            "usuariosTableBody"
        );


    if (tbody) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    ${escapeHTML(
                        mensaje
                    )}

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   MANEJO DE ERRORES FIREBASE
========================================================= */

function manejarErrorFirebase(
    error,
    mensajeGenerico
) {

    console.error(
        "Firebase:",
        error
    );


    if (
        error &&
        (
            error.code ===
            "permission-denied"

            ||

            error.code ===
            "firestore/permission-denied"
        )
    ) {

        alert(
            "Firebase rechazó la operación por permisos insuficientes."
        );

        return;
    }


    if (
        error &&
        error.code ===
        "failed-precondition"
    ) {

        alert(
            "Firestore necesita un índice para realizar esta consulta."
        );

        return;
    }


    alert(
        mensajeGenerico
    );

}
