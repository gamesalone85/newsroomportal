/* =========================================================
   NEWSROOM PORTAL
   ADMINISTRACIÓN DE USUARIOS
   FIREBASE / FIRESTORE / AUTHENTICATION
========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const NEWSROOM_USERS_COLLECTION = "usuarios";


/* =========================================================
   ROLES DEL SISTEMA
========================================================= */

const NEWSROOM_ROLES = {

    1: "Administrador",
    2: "Soporte",
    3: "Usuario",
    4: "Rooms Admin"

};


/* =========================================================
   ESTADO LOCAL
========================================================= */

let newsroomUsuarios = [];


/*
 * IMPORTANTE:
 *
 * NO declarar newsroomSecondaryAuth aquí.
 *
 * firebase-config.js ya crea:
 *
 * let newsroomSecondaryAuth = null;
 *
 * y la inicializa utilizando la app:
 *
 * "NewsroomUserCreation"
 *
 * Este archivo solamente utiliza esa variable.
 */


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
           VERIFICAR FIREBASE SDK
        ===================================================== */

        if (
            typeof firebase ===
            "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firebase SDK no está disponible."
            );

            mostrarErrorGeneral(
                "Firebase no está disponible."
            );

            return;

        }


        /* =====================================================
           VERIFICAR FIRESTORE
        ===================================================== */

        if (
            typeof newsroomDB ===
            "undefined" ||
            !newsroomDB
        ) {

            console.error(
                "Newsroom Portal: Firestore no está disponible."
            );

            mostrarErrorGeneral(
                "No fue posible conectar con Firestore."
            );

            return;

        }


        /* =====================================================
           VERIFICAR AUTH SECUNDARIO
        ===================================================== */

        if (
            typeof newsroomSecondaryAuth ===
            "undefined" ||
            !newsroomSecondaryAuth
        ) {

            console.error(
                "Newsroom Portal: Firebase Authentication secundaria no está disponible."
            );

            mostrarErrorGeneral(
                "Firebase Authentication no está disponible."
            );

            return;

        }


        console.log(
            "Newsroom Portal: Auth secundaria disponible."
        );


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

            mostrarErrorGeneral(
                "No fue posible verificar la sesión."
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


                const uid =
                    data.uid ||
                    doc.id;


                const id =
                    data.id ||
                    null;


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
                        id,

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


        /* =====================================================
           ORDENAR
        ===================================================== */

        newsroomUsuarios.sort(
            function (a, b) {

                const idA =
                    Number(a.id);


                const idB =
                    Number(b.id);


                if (
                    !isNaN(idA) &&
                    !isNaN(idB)
                ) {

                    return idA - idB;

                }


                if (
                    !isNaN(idA)
                ) {

                    return -1;

                }


                if (
                    !isNaN(idB)
                ) {

                    return 1;

                }


                return String(
                    a.nombre ||
                    ""
                ).localeCompare(
                    String(
                        b.nombre ||
                        ""
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

    let session =
        null;


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


    tbody.innerHTML =
        "";


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
                    usuario.rol ||
                    ""
                )
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            const estadoClase =
                String(
                    usuario.estado ||
                    ""
                )
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            let idVisual =
                usuario.id;


            if (
                idVisual ===
                null ||
                idVisual ===
                undefined ||
                idVisual ===
                ""
            ) {

                idVisual =
                    usuario.uid;

            }


            let botonesEstado =
                "";


            if (
                Number(
                    usuario.rol_id
                ) !==
                1
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
                            data-id="${escapeHTML(
                                usuario.firestoreId
                            )}"
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
                            data-id="${escapeHTML(
                                usuario.firestoreId
                            )}"
                        >
                            Activar
                        </button>

                    `;

                }

            }


            let botonEliminar =
                "";


            if (
                Number(
                    usuario.rol_id
                ) !==
                1
            ) {

                botonEliminar = `

                    <button
                        type="button"
                        class="btn-admin btn-delete"
                        data-action="delete"
                        data-id="${escapeHTML(
                            usuario.firestoreId
                        )}"
                    >
                        Eliminar
                    </button>

                `;

            }


            tr.innerHTML = `

                <td>
                    #${escapeHTML(idVisual)}
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
                        class="role-badge role-${escapeHTML(
                            rolClase
                        )}"
                    >
                        ${escapeHTML(usuario.rol)}
                    </span>

                </td>

                <td>

                    <span
                        class="status-badge status-${escapeHTML(
                            estadoClase
                        )}"
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
                            data-id="${escapeHTML(
                                usuario.firestoreId
                            )}"
                        >
                            Editar
                        </button>


                        <button
                            type="button"
                            class="btn-admin btn-reset"
                            data-action="reset"
                            data-id="${escapeHTML(
                                usuario.firestoreId
                            )}"
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
                "3"
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
        ).value.trim()
        .toLowerCase();


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
        !NEWSROOM_ROLES[
            rolId
        ]
    ) {

        mostrarError(
            "formError",
            "El rol seleccionado no es válido."
        );

        return;

    }


    if (!id) {

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


        await crearUsuarioNuevo({

            nombre:
                nombre,

            usuario:
                usuario,

            correo:
                correo,

            password:
                password,

            rolId:
                rolId

        });


        return;

    }


    const usuarioExistente =
        buscarUsuario(
            id
        );


    if (!usuarioExistente) {

        mostrarError(
            "formError",
            "No se encontró el usuario."
        );

        return;

    }


    const usuarioNormalizado =
        usuario
            .trim()
            .toLowerCase();


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
                    usuarioNormalizado

                    &&

                    String(
                        item.firestoreId
                    ) !==
                    String(
                        id
                    )

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


    try {

        await newsroomDB
            .collection(
                NEWSROOM_USERS_COLLECTION
            )
            .doc(
                id
            )
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
   CREAR USUARIO NUEVO
========================================================= */

async function crearUsuarioNuevo(
    datos
) {

    console.log(
        "Newsroom Portal: iniciando creación de usuario..."
    );


    /*
     * newsroomSecondaryAuth viene de firebase-config.js.
     */

    if (
        typeof newsroomSecondaryAuth ===
        "undefined" ||
        !newsroomSecondaryAuth
    ) {

        mostrarError(
            "formError",
            "Firebase Authentication secundaria no está disponible."
        );

        return;

    }


    const usuarioNormalizado =
        datos.usuario
            .trim()
            .toLowerCase();


    const usuarioDuplicado =
        newsroomUsuarios.find(
            function (item) {

                return (
                    String(
                        item.usuario ||
                        ""
                    )
                        .trim()
                        .toLowerCase() ===
                    usuarioNormalizado
                );

            }
        );


    if (usuarioDuplicado) {

        mostrarError(
            "formError",
            "El nombre de usuario ya existe."
        );

        return;

    }


    const form =
        document.getElementById(
            "usuarioForm"
        );


    const submitButton =
        form
            ? form.querySelector(
                'button[type="submit"]'
            )
            : null;


    const textoOriginal =
        submitButton
            ? submitButton.textContent
            : "";


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Creando usuario...";

    }


    let authUser =
        null;


    try {

        console.log(
            "Newsroom Portal: creando cuenta en Firebase Authentication:",
            datos.correo
        );


        /* =================================================
           CREAR CUENTA EN AUTH SECUNDARIA
        ================================================= */

        const userCredential =
            await newsroomSecondaryAuth
                .createUserWithEmailAndPassword(
                    datos.correo,
                    datos.password
                );


        authUser =
            userCredential.user;


        console.log(
            "Newsroom Portal: usuario creado en Authentication:",
            authUser.uid
        );


        /* =================================================
           CREAR PERFIL FIRESTORE
        ================================================= */

        await newsroomDB
            .collection(
                NEWSROOM_USERS_COLLECTION
            )
            .doc(
                authUser.uid
            )
            .set({

                uid:
                    authUser.uid,

                nombre:
                    datos.nombre,

                usuario:
                    datos.usuario,

                correo:
                    datos.correo,

                rol_id:
                    datos.rolId,

                rol_nombre:
                    obtenerNombreRol(
                        datos.rolId
                    ),

                estado:
                    "Activo",

                creado_por:
                    "Administrador",

                fecha_creacion:
                    firebase.firestore.FieldValue.serverTimestamp()

            });


        console.log(
            "Newsroom Portal: perfil creado correctamente en Firestore."
        );


        cerrarModalUsuario();


        if (form) {

            form.reset();

        }


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


        if (authUser) {

            console.warn(
                "Authentication creó la cuenta, pero ocurrió un problema creando el perfil Firestore.",
                authUser.uid
            );

        }


        let mensaje =
            "No fue posible crear el usuario.";


        switch (
            error &&
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
                    "Firebase Authentication creó la cuenta, pero Firestore rechazó la creación del perfil por permisos.";

                break;


            default:

                if (
                    error &&
                    error.message
                ) {

                    mensaje =
                        error.message;

                }

                break;

        }


        mostrarError(
            "formError",
            mensaje
        );

    }
    finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                textoOriginal ||
                "Guardar";

        }

    }

}


/* =========================================================
   NOMBRE DEL ROL
========================================================= */

function obtenerNombreRol(
    rolId
) {

    return (
        NEWSROOM_ROLES[
            Number(
                rolId
            )
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
        ) ===
        1
    ) {

        alert(
            "El administrador principal no puede ser suspendido."
        );

        return;

    }


    const accion =
        nuevoEstado ===
        "Activo"

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
            nuevoEstado ===
            "Activo"

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
        ) ===
        1
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


    mostrarError(
        "passwordError",
        "El restablecimiento administrativo de contraseñas requiere Firebase Admin SDK o una función backend segura."
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    valor
) {

    return String(
        valor ??
        ""
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
        error.code ===
        "permission-denied"
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


    if (
        error &&
        error.code ===
        "unauthenticated"
    ) {

        alert(
            "La sesión de Firebase no es válida o ha expirado."
        );

        return;

    }


    alert(
        mensajeGenerico
    );

}
