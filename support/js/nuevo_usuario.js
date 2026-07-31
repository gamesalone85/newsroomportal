/* =========================================================
   NEWSROOM PORTAL
   CREAR USUARIO
   ========================================================= */


/* =========================================================
   INICIALIZAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           VALIDAR SESIÓN
        ================================================== */

        if (
            !verificarSesion(
                "../../login.html"
            )
        ) {

            return;

        }



        /* =================================================
           VALIDAR PERMISOS
           
           PHP ORIGINAL:

           rol 1 = Administrador
           rol 4 = Rooms Admin
        ================================================== */

        const session =
            obtenerSesion();


        const rol =
            Number(
                session.rol_id
            );


        if (
            rol !== 1 &&
            rol !== 4
        ) {


            window.location.href =
                "../dashboard/index.html";


            return;

        }



        /* =================================================
           INFORMACIÓN DEL USUARIO ACTUAL
        ================================================== */

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
                session.nombre ||
                session.usuario;

        }


        if (userAvatar) {

            const nombre =
                session.nombre ||
                session.usuario ||
                "A";


            userAvatar.textContent =
                nombre
                    .charAt(0)
                    .toUpperCase();

        }



        /* =================================================
           ELEMENTOS
        ================================================== */

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
           CARGAR ROLES
        ================================================== */

        if (rolSelect) {


            NEWSROOM_ROLES.forEach(
                rol => {


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

        }



        /* =================================================
           MOSTRAR MENSAJE
        ================================================== */

        function mostrarMensaje(
            texto,
            tipo = "error"
        ) {


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



        /* =================================================
           OCULTAR MENSAJE
        ================================================== */

        function ocultarMensaje() {


            if (!message) {

                return;

            }


            message.textContent =
                "";


            message.style.display =
                "none";

        }



        /* =================================================
           ENVIAR FORMULARIO
        ================================================== */

        if (form) {


            form.addEventListener(
                "submit",
                event => {


                    event.preventDefault();


                    ocultarMensaje();



                    /* =========================================
                       OBTENER DATOS
                    ========================================= */

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
                            .trim();


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


                    if (
                        !password ||
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
                       BOTÓN
                    ========================================= */

                    if (guardarButton) {

                        guardarButton.disabled =
                            true;


                        guardarButton.textContent =
                            "Guardando...";

                    }



                    /* =========================================
                       CREAR USUARIO
                    ========================================= */

                    const resultado =
                        crearUsuario({

                            nombre:
                                nombre,

                            usuario:
                                usuario,

                            correo:
                                correo,

                            password:
                                password,

                            rol_id:
                                rol_id

                        });



                    /* =========================================
                       RESULTADO
                    ========================================= */

                    if (
                        !resultado.success
                    ) {


                        mostrarMensaje(
                            resultado.message
                        );


                        if (guardarButton) {

                            guardarButton.disabled =
                                false;


                            guardarButton.textContent =
                                "Guardar Usuario";

                        }


                        return;

                    }



                    /* =========================================
                       LIMPIAR FORMULARIO
                    ========================================= */

                    form.reset();



                    /* =========================================
                       MENSAJE
                    ========================================= */

                    mostrarMensaje(
                        "Usuario creado correctamente. Regresando a Administración...",
                        "success"
                    );



                    /* =========================================
                       REGRESAR AL LISTADO
                    ========================================= */

                    setTimeout(
                        () => {

                            window.location.href =
                                "index.html";

                        },
                        1000
                    );


                }
            );

        }


    }
);
