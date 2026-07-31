/* =========================================================
   NEWSROOM PORTAL
   ADMINISTRACIÓN DE USUARIOS
   ========================================================= */


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =================================================
           VERIFICAR AUTH.JS
        ================================================= */

        if (
            typeof verificarSesion !== "function"
        ) {

            console.error(
                "Newsroom Portal: auth.js no está disponible."
            );

            return;
        }


        /* =================================================
           VERIFICAR SESIÓN
        ================================================= */

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
                "Newsroom Portal: No existe sesión."
            );

            return;
        }


        /* =================================================
           VERIFICAR ROL ADMINISTRADOR
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
           INFORMACIÓN DEL USUARIO
        ================================================= */

        actualizarUsuario();


        /* =================================================
           CARGAR TABLA
        ================================================= */

        renderizarUsuarios();


        /* =================================================
           ACTUALIZAR KPIs
        ================================================= */

        actualizarKPIs();


        /* =================================================
           CONFIGURAR EVENTOS
        ================================================= */

        configurarEventos();


        console.log(
            "Newsroom Portal: Administración inicializada correctamente."
        );

    }
);



/* =========================================================
   ACTUALIZAR USUARIO EN TOPBAR
========================================================= */

function actualizarUsuario() {

    if (
        typeof obtenerSesion !== "function"
    ) {

        return;
    }


    const session =
        obtenerSesion();


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
   OBTENER USUARIOS
========================================================= */

function obtenerUsuariosAdmin() {

    if (
        typeof obtenerUsuarios ===
        "function"
    ) {

        const usuarios =
            obtenerUsuarios();


        if (
            Array.isArray(usuarios)
        ) {

            return usuarios;

        }

    }


    if (
        typeof NEWSROOM_USERS !==
        "undefined" &&
        Array.isArray(NEWSROOM_USERS)
    ) {

        return NEWSROOM_USERS;

    }


    console.error(
        "Newsroom Portal: No existe NEWSROOM_USERS."
    );


    return [];

}



/* =========================================================
   RENDERIZAR TABLA
========================================================= */

function renderizarUsuarios() {

    const tbody =
        document.getElementById(
            "usuariosTableBody"
        );


    if (!tbody) {

        console.warn(
            "No existe usuariosTableBody."
        );

        return;
    }


    const usuarios =
        obtenerUsuariosAdmin();


    tbody.innerHTML =
        "";


    /* =====================================================
       SIN USUARIOS
    ===================================================== */

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


    /* =====================================================
       GENERAR FILAS
    ===================================================== */

    usuarios.forEach(
        usuario => {

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


            /* =================================================
               BOTÓN ESTADO
            ================================================= */

            let botonEstado = "";


            if (
                Number(usuario.rol_id) !== 1
            ) {

                if (
                    usuario.estado ===
                    "Activo"
                ) {

                    botonEstado = `

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

                    botonEstado = `

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


            /* =================================================
               BOTÓN ELIMINAR
            ================================================= */

            let botonEliminar = "";


            if (
                Number(usuario.rol_id) !== 1
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


            /* =================================================
               HTML FILA
            ================================================= */

            tr.innerHTML = `

                <td>
                    #${escapeHTML(usuario.id)}
                </td>


                <td>
                    ${escapeHTML(
                        usuario.nombre
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        usuario.usuario
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        usuario.correo ||
                        ""
                    )}
                </td>


                <td>

                    <span
                        class="role-badge role-${escapeHTML(
                            rolClase
                        )}"
                    >

                        ${escapeHTML(
                            usuario.rol ||
                            "Usuario"
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="status-badge status-${escapeHTML(
                            estadoClase
                        )}"
                    >

                        ${escapeHTML(
                            usuario.estado ||
                            "Activo"
                        )}

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


                        ${botonEstado}


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
            function () {

                abrirModalUsuario();

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
       CERRAR PASSWORD
    ===================================================== */

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


    /* =====================================================
       FORM PASSWORD
    ===================================================== */

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
       ACCIONES DE TABLA
    ===================================================== */

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


    /* =====================================================
       CERRAR MODAL USUARIO AL HACER CLICK FUERA
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
       CERRAR MODAL PASSWORD AL HACER CLICK FUERA
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
   MANEJAR ACCIONES DE USUARIO
========================================================= */

function manejarAccionUsuario(
    event
) {

    const button =
        event.target.closest(
            "button[data-action]"
        );


    if (!button) {

        return;
    }


    event.preventDefault();


    event.stopPropagation();


    const action =
        button.dataset.action;


    const id =
        Number(
            button.dataset.id
        );


    console.log(
        "Newsroom Portal - Acción:",
        action,
        "ID:",
        id
    );


    const usuario =
        buscarUsuario(
            id
        );


    if (!usuario) {

        console.error(
            "Usuario no encontrado:",
            id
        );


        alert(
            "No se encontró el usuario seleccionado."
        );


        return;
    }


    /* =====================================================
       EDITAR
    ===================================================== */

    if (
        action ===
        "edit"
    ) {

        abrirModalUsuario(
            usuario
        );

        return;
    }


    /* =====================================================
       RESET PASSWORD
    ===================================================== */

    if (
        action ===
        "reset"
    ) {

        abrirModalPassword(
            usuario
        );

        return;
    }


    /* =====================================================
       SUSPENDER
    ===================================================== */

    if (
        action ===
        "suspend"
    ) {

        cambiarEstado(
            usuario,
            "Suspendido"
        );

        return;
    }


    /* =====================================================
       ACTIVAR
    ===================================================== */

    if (
        action ===
        "activate"
    ) {

        cambiarEstado(
            usuario,
            "Activo"
        );

        return;
    }


    /* =====================================================
       ELIMINAR
    ===================================================== */

    if (
        action ===
        "delete"
    ) {

        eliminarUsuario(
            usuario
        );

        return;
    }


    console.warn(
        "Acción desconocida:",
        action
    );

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

    const modal =
        document.getElementById(
            "usuarioModal"
        );


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


    if (!modal) {

        console.error(
            "No existe usuarioModal."
        );

        return;
    }


    ocultarError(
        "formError"
    );


    /* =====================================================
       EDITAR
    ===================================================== */

    if (usuario) {

        if (title) {

            title.textContent =
                "Editar Usuario";

        }


        if (id) {

            id.value =
                usuario.id;

        }


        if (nombre) {

            nombre.value =
                usuario.nombre ||
                "";

        }


        if (usuarioInput) {

            usuarioInput.value =
                usuario.usuario ||
                "";

        }


        if (correo) {

            correo.value =
                usuario.correo ||
                "";

        }


        if (rol) {

            rol.value =
                usuario.rol_id ||
                "";

        }


        if (password) {

            password.value =
                "";

            password.removeAttribute(
                "required"
            );

        }


        if (passwordGroup) {

            passwordGroup.style.display =
                "none";

        }

    }


    /* =====================================================
       NUEVO
    ===================================================== */

    else {

        if (title) {

            title.textContent =
                "Nuevo Usuario";

        }


        if (id) {

            id.value =
                "";

        }


        if (nombre) {

            nombre.value =
                "";

        }


        if (usuarioInput) {

            usuarioInput.value =
                "";

        }


        if (correo) {

            correo.value =
                "";

        }


        if (rol) {

            rol.value =
                "2";

        }


        if (password) {

            password.value =
                "";

            password.setAttribute(
                "required",
                "required"
            );

        }


        if (passwordGroup) {

            passwordGroup.style.display =
                "";

        }

    }


    modal.style.display =
        "flex";

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


    /* =====================================================
       VALIDAR DUPLICADO
    ===================================================== */

    const duplicado =
        usuarios.find(
            item => {

                const usuarioExistente =
                    String(
                        item.usuario ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const usuarioNuevo =
                    usuario
                        .trim()
                        .toLowerCase();


                return (
                    usuarioExistente ===
                    usuarioNuevo
                )
                &&
                Number(item.id) !==
                Number(id || 0);

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
       ACTUALIZAR
    ===================================================== */

    if (id) {

        const actualizado =
            actualizarUsuarioTemporal(
                Number(id),
                {
                    nombre:
                        nombre,

                    usuario:
                        usuario,

                    correo:
                        correo,

                    rol_id:
                        rolId
                }
            );


        if (!actualizado) {

            mostrarError(
                "formError",
                "No fue posible actualizar el usuario."
            );

            return;
        }


        cerrarModalUsuario();


        renderizarUsuarios();


        actualizarKPIs();


        alert(
            "Usuario actualizado correctamente."
        );


        return;
    }


    /* =====================================================
       CREAR
    ===================================================== */

    const creado =
        crearUsuarioTemporal(
            {
                nombre:
                    nombre,

                usuario:
                    usuario,

                correo:
                    correo,

                password:
                    password,

                rol_id:
                    rolId
            }
        );


    if (!creado) {

        mostrarError(
            "formError",
            "No fue posible crear el usuario."
        );

        return;
    }


    cerrarModalUsuario();


    renderizarUsuarios();


    actualizarKPIs();


    alert(
        "Usuario creado correctamente."
    );

}



/* =========================================================
   CREAR USUARIO TEMPORAL
========================================================= */

function crearUsuarioTemporal(
    datos
) {

    if (
        typeof NEWSROOM_USERS ===
        "undefined"
    ) {

        console.error(
            "NEWSROOM_USERS no está disponible."
        );

        return false;
    }


    const nuevoId =
        NEWSROOM_USERS.length
            ? Math.max(
                ...NEWSROOM_USERS.map(
                    usuario =>
                        Number(
                            usuario.id
                        )
                )
            ) + 1
            : 1;


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


    NEWSROOM_USERS.push({

        id:
            nuevoId,

        usuario:
            datos.usuario,

        nombre:
            datos.nombre,

        correo:
            datos.correo,

        rol_id:
            datos.rol_id,

        rol:
            roles[
                datos.rol_id
            ] ||
            "Usuario",

        estado:
            "Activo",

        password:
            datos.password ||
            ""

    });


    console.log(
        "Usuario creado:",
        nuevoId
    );


    return true;

}



/* =========================================================
   ACTUALIZAR USUARIO TEMPORAL
========================================================= */

function actualizarUsuarioTemporal(
    id,
    datos
) {

    if (
        typeof NEWSROOM_USERS ===
        "undefined"
    ) {

        console.error(
            "NEWSROOM_USERS no está disponible."
        );

        return false;
    }


    const usuario =
        NEWSROOM_USERS.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!usuario) {

        console.error(
            "No se encontró usuario:",
            id
        );

        return false;
    }


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


    usuario.nombre =
        datos.nombre;


    usuario.usuario =
        datos.usuario;


    usuario.correo =
        datos.correo;


    usuario.rol_id =
        Number(
            datos.rol_id
        );


    usuario.rol =
        roles[
            datos.rol_id
        ] ||
        "Usuario";


    console.log(
        "Usuario actualizado:",
        usuario
    );


    return true;

}



/* =========================================================
   CAMBIAR ESTADO
========================================================= */

function cambiarEstado(
    usuario,
    nuevoEstado
) {

    if (!usuario) {

        alert(
            "Usuario no encontrado."
        );

        return;
    }


    /* =====================================================
       PROTEGER ADMINISTRADOR
    ===================================================== */

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


    /* =====================================================
       ACTUALIZAR ESTADO
    ===================================================== */

    usuario.estado =
        nuevoEstado;


    renderizarUsuarios();


    actualizarKPIs();


    alert(
        nuevoEstado === "Activo"
            ? "Usuario activado correctamente."
            : "Usuario suspendido correctamente."
    );


    console.log(
        "Estado actualizado:",
        usuario.id,
        nuevoEstado
    );

}



/* =========================================================
   ELIMINAR USUARIO
========================================================= */

function eliminarUsuario(
    usuario
) {

    if (!usuario) {

        alert(
            "Usuario no encontrado."
        );

        return;
    }


    /* =====================================================
       PROTEGER ADMINISTRADOR PRINCIPAL
    ===================================================== */

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

        alert(
            "No está disponible la base de datos temporal."
        );

        return;
    }


    /* =====================================================
       BUSCAR USUARIO
    ===================================================== */

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
            "No se encontró el usuario."
        );

        return;
    }


    /* =====================================================
       ELIMINAR
    ===================================================== */

    NEWSROOM_USERS.splice(
        index,
        1
    );


    /* =====================================================
       ACTUALIZAR INTERFAZ
    ===================================================== */

    renderizarUsuarios();


    actualizarKPIs();


    alert(
        "Usuario eliminado correctamente."
    );


    console.log(
        "Usuario eliminado:",
        usuario.id
    );

}



/* =========================================================
   ABRIR MODAL PASSWORD
========================================================= */

function abrirModalPassword(
    usuario
) {

    if (!usuario) {

        alert(
            "Usuario no encontrado."
        );

        return;
    }


    const modal =
        document.getElementById(
            "passwordModal"
        );


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


    if (!modal) {

        console.error(
            "No existe passwordModal."
        );

        return;
    }


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


    /* =====================================================
       VALIDACIONES
    ===================================================== */

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
        password.length < 6
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


    /* =====================================================
       ACTUALIZAR PASSWORD
    ===================================================== */

    usuario.password =
        password;


    cerrarModalPassword();


    alert(
        "Contraseña actualizada correctamente."
    );


    console.log(
        "Password actualizado para usuario:",
        usuario.id
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

        console.error(
            "Elemento de error no encontrado:",
            id
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
