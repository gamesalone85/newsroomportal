/* =========================================================
   NEWSROOM PORTAL
   ADMINISTRACIÓN DE USUARIOS
   VERSIÓN GITHUB PAGES
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const NEWSROOM_USERS_STORAGE =
    "newsroomUsers";


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Newsroom Portal: admin.js cargado correctamente."
        );


        /* =================================================
           VERIFICAR AUTH
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


        const session =
            typeof obtenerSesion === "function"
                ? obtenerSesion()
                : null;


        if (!session) {

            console.error(
                "No existe una sesión activa."
            );

            return;

        }


        /* =================================================
           VERIFICAR ADMIN
        ================================================= */

        if (
            Number(session.rol_id) !== 1
        ) {

            alert(
                "No tienes permisos para acceder a esta sección."
            );


            window.location.href =
                "../dashboard/index.html";


            return;

        }


        /* =================================================
           INFORMACIÓN USUARIO
        ================================================= */

        actualizarUsuario();


        /* =================================================
           INICIALIZAR DATOS
        ================================================= */

        inicializarUsuarios();


        /* =================================================
           RENDER
        ================================================= */

        renderizarUsuarios();

        actualizarKPIs();


        /* =================================================
           EVENTOS
        ================================================= */

        configurarEventos();


        console.log(
            "Newsroom Portal: administración inicializada."
        );

    }
);



/* =========================================================
   INICIALIZAR USUARIOS
========================================================= */

function inicializarUsuarios() {

    const almacenados =
        localStorage.getItem(
            NEWSROOM_USERS_STORAGE
        );


    /*
     * Si ya existen usuarios guardados
     * no hacemos nada.
     */

    if (almacenados) {

        return;

    }


    /*
     * Tomamos los usuarios de data.js
     */

    if (
        typeof NEWSROOM_USERS !== "undefined"
    ) {

        const copia =
            JSON.parse(
                JSON.stringify(
                    NEWSROOM_USERS
                )
            );


        localStorage.setItem(
            NEWSROOM_USERS_STORAGE,
            JSON.stringify(copia)
        );


        console.log(
            "Usuarios iniciales guardados en localStorage."
        );

    }

}



/* =========================================================
   OBTENER USUARIOS
========================================================= */

function obtenerUsuariosAdmin() {

    try {

        const almacenados =
            localStorage.getItem(
                NEWSROOM_USERS_STORAGE
            );


        if (almacenados) {

            return JSON.parse(
                almacenados
            );

        }

    }
    catch (error) {

        console.error(
            "Error leyendo usuarios:",
            error
        );

    }


    /*
     * Fallback a data.js
     */

    if (
        typeof NEWSROOM_USERS !== "undefined"
    ) {

        return NEWSROOM_USERS;

    }


    return [];

}



/* =========================================================
   GUARDAR USUARIOS
========================================================= */

function guardarUsuariosLocal(
    usuarios
) {

    try {

        localStorage.setItem(
            NEWSROOM_USERS_STORAGE,
            JSON.stringify(
                usuarios
            )
        );


        return true;

    }
    catch (error) {

        console.error(
            "No se pudieron guardar los usuarios:",
            error
        );


        alert(
            "No fue posible guardar los cambios en el navegador."
        );


        return false;

    }

}



/* =========================================================
   ACTUALIZAR USUARIO TOPBAR
========================================================= */

function actualizarUsuario() {

    const session =
        typeof obtenerSesion === "function"
            ? obtenerSesion()
            : null;


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

        console.error(
            "No existe #usuariosTableBody."
        );

        return;

    }


    const usuarios =
        obtenerUsuariosAdmin();


    tbody.innerHTML =
        "";


    if (
        usuarios.length === 0
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


    usuarios.forEach(
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
                .toLowerCase();


            const esAdmin =
                Number(
                    usuario.rol_id
                ) === 1;


            let acciones = `

                <button
                    type="button"
                    class="btn-admin btn-edit"
                    data-action="edit"
                    data-id="${usuario.id}"
                >
                    Editar
                </button>


                <button
                    type="button"
                    class="btn-admin btn-reset"
                    data-action="reset"
                    data-id="${usuario.id}"
                >
                    Reset Password
                </button>

            `;


            if (!esAdmin) {

                if (
                    usuario.estado === "Activo"
                ) {

                    acciones += `

                        <button
                            type="button"
                            class="btn-admin btn-suspend"
                            data-action="suspend"
                            data-id="${usuario.id}"
                        >
                            Suspender
                        </button>

                    `;

                }
                else {

                    acciones += `

                        <button
                            type="button"
                            class="btn-admin btn-activate"
                            data-action="activate"
                            data-id="${usuario.id}"
                        >
                            Activar
                        </button>

                    `;

                }


                acciones += `

                    <button
                        type="button"
                        class="btn-admin btn-delete"
                        data-action="delete"
                        data-id="${usuario.id}"
                    >
                        Eliminar
                    </button>

                `;

            }


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
                    ${escapeHTML(usuario.correo || "")}
                </td>


                <td>

                    <span
                        class="role-badge role-${rolClase}"
                    >
                        ${escapeHTML(usuario.rol || "")}
                    </span>

                </td>


                <td>

                    <span
                        class="status-badge status-${estadoClase}"
                    >
                        ${escapeHTML(usuario.estado || "")}
                    </span>

                </td>


                <td>

                    <div class="action-group">

                        ${acciones}

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
   KPIs
========================================================= */

function actualizarKPIs() {

    const usuarios =
        obtenerUsuariosAdmin();


    const total =
        usuarios.length;


    const activos =
        usuarios.filter(
            function (usuario) {

                return (
                    usuario.estado ===
                    "Activo"
                );

            }
        ).length;


    const suspendidos =
        usuarios.filter(
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
        "Configurando eventos de administración..."
    );


    /* =================================================
       NUEVO USUARIO
    ================================================= */

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
    else {

        console.error(
            "No se encontró #nuevoUsuarioBtn."
        );

    }


    /* =================================================
       MODAL USUARIO
    ================================================= */

    const cerrarModal =
        document.getElementById(
            "cerrarModal"
        );


    const cancelarUsuario =
        document.getElementById(
            "cancelarUsuario"
        );


    if (cerrarModal) {

        cerrarModal.addEventListener(
            "click",
            cerrarModalUsuario
        );

    }


    if (cancelarUsuario) {

        cancelarUsuario.addEventListener(
            "click",
            cerrarModalUsuario
        );

    }


    /* =================================================
       FORM USUARIO
    ================================================= */

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
    else {

        console.error(
            "No se encontró #usuarioForm."
        );

    }


    /* =================================================
       MODAL PASSWORD
    ================================================= */

    const cerrarPasswordModal =
        document.getElementById(
            "cerrarPasswordModal"
        );


    const cancelarPassword =
        document.getElementById(
            "cancelarPassword"
        );


    if (cerrarPasswordModal) {

        cerrarPasswordModal.addEventListener(
            "click",
            cerrarModalPassword
        );

    }


    if (cancelarPassword) {

        cancelarPassword.addEventListener(
            "click",
            cerrarModalPassword
        );

    }


    /* =================================================
       FORM PASSWORD
    ================================================= */

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


    /* =================================================
       TABLA
    ================================================= */

    const tbody =
        document.getElementById(
            "usuariosTableBody"
        );


    if (tbody) {

        tbody.addEventListener(
            "click",
            manejarAccionUsuario
        );

    }


    /* =================================================
       CLICK FUERA DEL MODAL
    ================================================= */

    const usuarioModal =
        document.getElementById(
            "usuarioModal"
        );


    const passwordModal =
        document.getElementById(
            "passwordModal"
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
   MANEJAR ACCIONES DE TABLA
========================================================= */

function manejarAccionUsuario(
    event
) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {

        return;

    }


    event.preventDefault();


    const action =
        button.getAttribute(
            "data-action"
        );


    const id =
        Number(
            button.getAttribute(
                "data-id"
            )
        );


    console.log(
        "Acción:",
        action,
        "ID:",
        id
    );


    const usuario =
        buscarUsuario(
            id
        );


    if (!usuario) {

        alert(
            "Usuario no encontrado."
        );

        return;

    }


    switch (
        action
    ) {

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
    id
) {

    const usuarios =
        obtenerUsuariosAdmin();


    return usuarios.find(
        function (usuario) {

            return (
                Number(usuario.id) ===
                Number(id)
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
            usuario.id;


        nombre.value =
            usuario.nombre || "";


        usuarioInput.value =
            usuario.usuario || "";


        correo.value =
            usuario.correo || "";


        rol.value =
            usuario.rol_id || "2";


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
            "2";


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



    /*
     * Asegurar que el modal quede visible
     */

    modal.style.visibility =
        "visible";


    modal.style.opacity =
        "1";

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

function guardarUsuario(
    event
) {

    event.preventDefault();


    console.log(
        "Guardando usuario..."
    );


    const id =
        document.getElementById(
            "usuarioId"
        ).value.trim();


    const nombre =
        document.getElementById(
            "nombre"
        ).value.trim();


    const usuarioNombre =
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


    /* =================================================
       VALIDACIÓN
    ================================================= */

    if (
        !nombre ||
        !usuarioNombre
    ) {

        mostrarError(
            "formError",
            "Nombre y usuario son obligatorios."
        );

        return;

    }


    if (
        !id &&
        !password
    ) {

        mostrarError(
            "formError",
            "La contraseña es obligatoria para un nuevo usuario."
        );

        return;

    }


    const usuarios =
        obtenerUsuariosAdmin();


    const duplicado =
        usuarios.find(
            function (item) {

                return (

                    String(
                        item.usuario || ""
                    )
                    .toLowerCase() ===
                    usuarioNombre.toLowerCase()

                    &&

                    Number(item.id) !==
                    Number(id || 0)

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


    /* =================================================
       EDITAR
    ================================================= */

    if (id) {

        const index =
            usuarios.findIndex(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(id)
                    );

                }
            );


        if (index === -1) {

            mostrarError(
                "formError",
                "No se encontró el usuario."
            );

            return;

        }


        usuarios[index].nombre =
            nombre;


        usuarios[index].usuario =
            usuarioNombre;


        usuarios[index].correo =
            correo;


        usuarios[index].rol_id =
            rolId;


        usuarios[index].rol =
            obtenerNombreRol(
                rolId
            );


        if (
            guardarUsuariosLocal(
                usuarios
            )
        ) {

            cerrarModalUsuario();


            renderizarUsuarios();


            actualizarKPIs();


            alert(
                "Usuario actualizado correctamente."
            );

        }


        return;

    }


    /* =================================================
       CREAR
    ================================================= */

    const nuevoId =
        usuarios.length > 0

            ?

            Math.max(
                ...usuarios.map(
                    function (item) {

                        return Number(
                            item.id
                        ) || 0;

                    }
                )
            ) + 1

            :

            1;


    const nuevoUsuario = {

        id:
            nuevoId,

        usuario:
            usuarioNombre,

        nombre:
            nombre,

        correo:
            correo,

        rol_id:
            rolId,

        rol:
            obtenerNombreRol(
                rolId
            ),

        estado:
            "Activo",

        password:
            password

    };


    usuarios.push(
        nuevoUsuario
    );


    if (
        guardarUsuariosLocal(
            usuarios
        )
    ) {

        cerrarModalUsuario();


        renderizarUsuarios();


        actualizarKPIs();


        alert(
            "Usuario creado correctamente."
        );

    }

}



/* =========================================================
   NOMBRE DEL ROL
========================================================= */

function obtenerNombreRol(
    rolId
) {

    const roles = {

        1: "Administrador",

        2: "Support",

        3: "Rooms",

        4: "Rooms Admin",

        5: "Vehicular",

        7: "Credencialización",

        8: "Capital Humano"

    };


    return (
        roles[rolId] ||
        "Usuario"
    );

}



/* =========================================================
   CAMBIAR ESTADO
========================================================= */

function cambiarEstado(
    usuario,
    nuevoEstado
) {

    if (
        Number(usuario.rol_id) === 1
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


    const usuarios =
        obtenerUsuariosAdmin();


    const index =
        usuarios.findIndex(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(usuario.id)
                );

            }
        );


    if (index === -1) {

        alert(
            "Usuario no encontrado."
        );

        return;

    }


    usuarios[index].estado =
        nuevoEstado;


    if (
        guardarUsuariosLocal(
            usuarios
        )
    ) {

        renderizarUsuarios();


        actualizarKPIs();


        alert(
            `Usuario ${accion === "activar" ? "activado" : "suspendido"} correctamente.`
        );

    }

}



/* =========================================================
   ELIMINAR USUARIO
========================================================= */

function eliminarUsuario(
    usuario
) {

    if (
        Number(usuario.rol_id) === 1
    ) {

        alert(
            "El administrador principal no puede eliminarse."
        );

        return;

    }


    const confirmar =
        confirm(
            `¿Eliminar definitivamente al usuario "${usuario.nombre}"?`
        );


    if (!confirmar) {

        return;

    }


    const usuarios =
        obtenerUsuariosAdmin();


    const nuevosUsuarios =
        usuarios.filter(
            function (item) {

                return (
                    Number(item.id) !==
                    Number(usuario.id)
                );

            }
        );


    if (
        guardarUsuariosLocal(
            nuevosUsuarios
        )
    ) {

        renderizarUsuarios();


        actualizarKPIs();


        alert(
            "Usuario eliminado correctamente."
        );

    }

}



/* =========================================================
   ABRIR RESET PASSWORD
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


    const userId =
        document.getElementById(
            "passwordUserId"
        );


    const userName =
        document.getElementById(
            "passwordUserName"
        );


    const newPassword =
        document.getElementById(
            "newPassword"
        );


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );


    if (userId) {

        userId.value =
            usuario.id;

    }


    if (userName) {

        userName.textContent =
            usuario.nombre;

    }


    if (newPassword) {

        newPassword.value =
            "";

    }


    if (confirmPassword) {

        confirmPassword.value =
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

}



/* =========================================================
   CERRAR PASSWORD
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

function guardarPassword(
    event
) {

    event.preventDefault();


    const id =
        Number(
            document.getElementById(
                "passwordUserId"
            ).value
        );


    const password =
        document.getElementById(
            "newPassword"
        ).value;


    const confirmar =
        document.getElementById(
            "confirmPassword"
        ).value;


    if (
        !password ||
        !confirmar
    ) {

        mostrarError(
            "passwordError",
            "Todos los campos son obligatorios."
        );

        return;

    }


    if (
        password !== confirmar
    ) {

        mostrarError(
            "passwordError",
            "Las contraseñas no coinciden."
        );

        return;

    }


    if (
        password.length < 6
    ) {

        mostrarError(
            "passwordError",
            "La contraseña debe tener al menos 6 caracteres."
        );

        return;

    }


    const usuarios =
        obtenerUsuariosAdmin();


    const index =
        usuarios.findIndex(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        );


    if (index === -1) {

        mostrarError(
            "passwordError",
            "Usuario no encontrado."
        );

        return;

    }


    usuarios[index].password =
        password;


    if (
        guardarUsuariosLocal(
            usuarios
        )
    ) {

        cerrarModalPassword();


        alert(
            "Contraseña actualizada correctamente."
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
   ERRORES
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

        return;

    }


    elemento.textContent =
        mensaje;


    elemento.style.display =
        "block";

}



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

