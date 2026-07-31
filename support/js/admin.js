/* =========================================================
   NEWSROOM PORTAL
   ADMINISTRACIÓN DE USUARIOS
   VERSIÓN GITHUB PAGES / HTML
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const STORAGE_KEY_USERS = "newsroomUsers";


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Newsroom Portal: admin.js cargado correctamente.");

    /* -----------------------------------------------------
       VERIFICAR SESIÓN
    ----------------------------------------------------- */

    if (typeof verificarSesion === "function") {

        const sesionValida = verificarSesion("../../login.html");

        if (!sesionValida) {
            return;
        }

    } else {

        console.warn(
            "Newsroom Portal: auth.js no está disponible."
        );

    }


    /* -----------------------------------------------------
       OBTENER SESIÓN
    ----------------------------------------------------- */

    let session = null;

    if (typeof obtenerSesion === "function") {

        session = obtenerSesion();

    }


    /* -----------------------------------------------------
       VERIFICAR ADMIN
    ----------------------------------------------------- */

    if (session) {

        if (Number(session.rol_id) !== 1) {

            alert(
                "No tienes permisos para acceder a esta sección."
            );

            window.location.href =
                "../dashboard/index.html";

            return;

        }

    }


    /* -----------------------------------------------------
       CARGAR USUARIOS
    ----------------------------------------------------- */

    inicializarUsuarios();


    /* -----------------------------------------------------
       ACTUALIZAR INFORMACIÓN
    ----------------------------------------------------- */

    actualizarUsuario();

    renderizarUsuarios();

    actualizarKPIs();


    /* -----------------------------------------------------
       CONFIGURAR EVENTOS
    ----------------------------------------------------- */

    configurarEventos();


    console.log(
        "Newsroom Portal: administración inicializada."
    );

});



/* =========================================================
   INICIALIZAR USUARIOS
========================================================= */

function inicializarUsuarios() {

    const guardados =
        localStorage.getItem(
            STORAGE_KEY_USERS
        );


    /*
     * Si ya existen usuarios guardados,
     * utilizamos esos.
     */

    if (guardados) {

        try {

            const usuarios =
                JSON.parse(
                    guardados
                );


            if (
                Array.isArray(
                    usuarios
                )
            ) {

                /*
                 * Actualizar la variable global
                 * si data.js está disponible.
                 */

                if (
                    typeof NEWSROOM_USERS !==
                    "undefined"
                ) {

                    NEWSROOM_USERS.length = 0;

                    usuarios.forEach(
                        usuario => {

                            NEWSROOM_USERS.push(
                                usuario
                            );

                        }
                    );

                }

                return;

            }

        } catch (error) {

            console.error(
                "Error leyendo usuarios guardados:",
                error
            );

        }

    }


    /*
     * Primera ejecución:
     * guardar los usuarios de data.js.
     */

    if (
        typeof NEWSROOM_USERS !==
        "undefined"
    ) {

        guardarUsuarios();

    }

}



/* =========================================================
   GUARDAR USUARIOS
========================================================= */

function guardarUsuarios() {

    if (
        typeof NEWSROOM_USERS ===
        "undefined"
    ) {

        return;

    }


    localStorage.setItem(
        STORAGE_KEY_USERS,
        JSON.stringify(
            NEWSROOM_USERS
        )
    );

}



/* =========================================================
   OBTENER USUARIOS
========================================================= */

function obtenerUsuariosAdmin() {

    /*
     * Preferimos NEWSROOM_USERS porque es la
     * estructura utilizada actualmente.
     */

    if (
        typeof NEWSROOM_USERS !==
        "undefined"
    ) {

        return NEWSROOM_USERS;

    }


    /*
     * Respaldo desde localStorage.
     */

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE_KEY_USERS
            )
        ) || [];

    } catch (error) {

        return [];

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
            "No se encontró usuariosTableBody."
        );

        return;

    }


    const usuarios =
        obtenerUsuariosAdmin();


    tbody.innerHTML =
        "";


    if (
        usuarios.length ===
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


            let botonesEstado = "";


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
                            data-id="${usuario.id}"
                        >
                            Suspender
                        </button>

                    `;

                } else {

                    botonesEstado = `

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

            }


            let botonEliminar = "";


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
   KPIs
========================================================= */

function actualizarKPIs() {

    const usuarios =
        obtenerUsuariosAdmin();


    const total =
        usuarios.length;


    const activos =
        usuarios.filter(
            usuario =>
                usuario.estado ===
                "Activo"
        ).length;


    const suspendidos =
        usuarios.filter(
            usuario =>
                usuario.estado ===
                "Suspendido"
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


    /* -----------------------------------------------------
       NUEVO USUARIO
    ----------------------------------------------------- */

    const nuevoUsuarioBtn =
        document.getElementById(
            "nuevoUsuarioBtn"
        );


    if (nuevoUsuarioBtn) {

        nuevoUsuarioBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                console.log(
                    "Click: Nuevo Usuario"
                );

                abrirModalUsuario();

            }
        );

    } else {

        console.error(
            "No se encontró nuevoUsuarioBtn."
        );

    }


    /* -----------------------------------------------------
       TABLA
    ----------------------------------------------------- */

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


                manejarAccionUsuario(
                    action,
                    id
                );

            }
        );

    }


    /* -----------------------------------------------------
       MODAL USUARIO - CERRAR
    ----------------------------------------------------- */

    const cerrarModal =
        document.getElementById(
            "cerrarModal"
        );


    if (cerrarModal) {

        cerrarModal.addEventListener(
            "click",
            function () {

                cerrarModalUsuario();

            }
        );

    }


    const cancelarUsuario =
        document.getElementById(
            "cancelarUsuario"
        );


    if (cancelarUsuario) {

        cancelarUsuario.addEventListener(
            "click",
            function () {

                cerrarModalUsuario();

            }
        );

    }


    /* -----------------------------------------------------
       FORMULARIO USUARIO
    ----------------------------------------------------- */

    const usuarioForm =
        document.getElementById(
            "usuarioForm"
        );


    if (usuarioForm) {

        usuarioForm.addEventListener(
            "submit",
            function (event) {

                guardarUsuario(
                    event
                );

            }
        );

    }


    /* -----------------------------------------------------
       MODAL PASSWORD
    ----------------------------------------------------- */

    const cerrarPasswordModal =
        document.getElementById(
            "cerrarPasswordModal"
        );


    if (cerrarPasswordModal) {

        cerrarPasswordModal.addEventListener(
            "click",
            function () {

                cerrarModalPassword();

            }
        );

    }


    const cancelarPassword =
        document.getElementById(
            "cancelarPassword"
        );


    if (cancelarPassword) {

        cancelarPassword.addEventListener(
            "click",
            function () {

                cerrarModalPassword();

            }
        );

    }


    /* -----------------------------------------------------
       FORM PASSWORD
    ----------------------------------------------------- */

    const passwordForm =
        document.getElementById(
            "passwordForm"
        );


    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            function (event) {

                guardarPassword(
                    event
                );

            }
        );

    }


    /* -----------------------------------------------------
       CERRAR MODALES AL HACER CLICK FUERA
    ----------------------------------------------------- */

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
    id
) {

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
    id
) {

    const usuarios =
        obtenerUsuariosAdmin();


    return usuarios.find(
        usuario =>
            Number(
                usuario.id
            ) ===
            Number(id)
    );

}



/* =========================================================
   ABRIR MODAL USUARIO
========================================================= */

function abrirModalUsuario(
    usuario = null
) {

    console.log(
        "Abriendo modal usuario:",
        usuario
    );


    const modal =
        document.getElementById(
            "usuarioModal"
        );


    if (!modal) {

        console.error(
            "No existe #usuarioModal en el HTML."
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

    } else {

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


    /*
     * Mostrar modal
     */

    modal.style.display =
        "flex";


    modal.style.visibility =
        "visible";


    modal.style.opacity =
        "1";
modal.style.position = "fixed";
modal.style.top = "0";
modal.style.left = "0";
modal.style.width = "100vw";
modal.style.height = "100vh";
modal.style.zIndex = "99999";
modal.style.backgroundColor = "rgba(0,0,0,0.75)";

    console.log(
        "Modal usuario visible."
    );

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


    /* -----------------------------------------------------
       VALIDACIÓN
    ----------------------------------------------------- */

    if (
        !nombre ||
        !usuario
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
            item =>

                String(
                    item.usuario || ""
                )
                .toLowerCase() ===
                usuario.toLowerCase()

                &&

                Number(
                    item.id
                ) !==
                Number(
                    id || 0
                )
        );


    if (duplicado) {

        mostrarError(
            "formError",
            "El nombre de usuario ya existe."
        );

        return;

    }


    /* -----------------------------------------------------
       EDITAR
    ----------------------------------------------------- */

    if (id) {

        const usuarioExistente =
            buscarUsuario(
                Number(id)
            );


        if (!usuarioExistente) {

            mostrarError(
                "formError",
                "No se encontró el usuario."
            );

            return;

        }


        usuarioExistente.nombre =
            nombre;


        usuarioExistente.usuario =
            usuario;


        usuarioExistente.correo =
            correo;


        usuarioExistente.rol_id =
            rolId;


        usuarioExistente.rol =
            obtenerNombreRol(
                rolId
            );


        /*
         * NO modificamos contraseña
         * al editar.
         */


        guardarUsuarios();


        cerrarModalUsuario();


        renderizarUsuarios();


        actualizarKPIs();


        alert(
            "Usuario actualizado correctamente."
        );


        return;

    }


    /* -----------------------------------------------------
       CREAR
    ----------------------------------------------------- */

    const usuariosActuales =
        obtenerUsuariosAdmin();


    let nuevoId = 1;


    if (
        usuariosActuales.length >
        0
    ) {

        nuevoId =
            Math.max(
                ...usuariosActuales.map(
                    item =>
                        Number(
                            item.id
                        ) || 0
                )
            ) + 1;

    }


    const nuevoUsuario = {

        id:
            nuevoId,

        usuario:
            usuario,

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


    if (
        typeof NEWSROOM_USERS !==
        "undefined"
    ) {

        NEWSROOM_USERS.push(
            nuevoUsuario
        );

    }


    guardarUsuarios();


    cerrarModalUsuario();


    renderizarUsuarios();


    actualizarKPIs();


    alert(
        "Usuario creado correctamente."
    );

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
            "Support",

        3:
            "Rooms",

        4:
            "Rooms Admin",

        5:
            "Vehicular",

        7:
            "Credencialización",

        8:
            "Capital Humano"

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


    usuario.estado =
        nuevoEstado;


    guardarUsuarios();


    renderizarUsuarios();


    actualizarKPIs();


    alert(
        nuevoEstado === "Activo"
            ? "Usuario activado correctamente."
            : "Usuario suspendido correctamente."
    );

}



/* =========================================================
   ELIMINAR USUARIO
========================================================= */

function eliminarUsuario(
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
            `¿Eliminar definitivamente al usuario "${usuario.nombre}"?`
        );


    if (!confirmar) {
        return;
    }


    if (
        typeof NEWSROOM_USERS ===
        "undefined"
    ) {

        return;

    }


    const index =
        NEWSROOM_USERS.findIndex(
            item =>
                Number(
                    item.id
                ) ===
                Number(
                    usuario.id
                )
        );


    if (
        index === -1
    ) {

        alert(
            "No se pudo encontrar el usuario."
        );

        return;

    }


    NEWSROOM_USERS.splice(
        index,
        1
    );


    guardarUsuarios();


    renderizarUsuarios();


    actualizarKPIs();


    alert(
        "Usuario eliminado correctamente."
    );

}



/* =========================================================
   ABRIR MODAL PASSWORD
========================================================= */

function abrirModalPassword(
    usuario
) {

    console.log(
        "Abriendo modal password:",
        usuario
    );


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
            usuario.id;

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


    console.log(
        "Modal password visible."
    );

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

function guardarPassword(
    event
) {

    event.preventDefault();


    console.log(
        "Actualizando contraseña..."
    );


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
        password.length <
        6
    ) {

        mostrarError(
            "passwordError",
            "La contraseña debe tener al menos 6 caracteres."
        );

        return;

    }


    if (
        password !==
        confirmar
    ) {

        mostrarError(
            "passwordError",
            "Las contraseñas no coinciden."
        );

        return;

    }


    const usuario =
        buscarUsuario(
            id
        );


    if (!usuario) {

        mostrarError(
            "passwordError",
            "Usuario no encontrado."
        );

        return;

    }


    usuario.password =
        password;


    guardarUsuarios();


    cerrarModalPassword();


    alert(
        "Contraseña actualizada correctamente."
    );

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
