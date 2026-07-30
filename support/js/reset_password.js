
/* =========================================================
   NEWSROOM PORTAL
   RESET PASSWORD
   =========================================================

   Sustituye:

   reset_password.php

   IMPORTANTE:

   Actualmente NO guardamos contraseñas en localStorage.

   La contraseña solamente se valida en el navegador.

   Cuando conectemos el sistema a:

       Firebase Authentication
       Supabase Auth
       API propia

   esta función será sustituida por el mecanismo
   real de cambio de contraseña.

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
           SESIÓN ACTUAL
        ================================================== */

        const session =
            obtenerSesion();


        if (!session) {

            return;

        }



        /* =================================================
           SOLO ADMINISTRADOR
           
           rol_id = 1
        ================================================== */

        if (
            Number(
                session.rol_id
            ) !== 1
        ) {


            window.location.href =
                "../dashboard/index.html";


            return;

        }



        /* =================================================
           INFORMACIÓN DEL ADMINISTRADOR
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
                session.usuario ||
                "Administrador";

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
           OBTENER ID
           
           reset_password.html?id=5
        ================================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const id =
            Number(
                params.get("id")
            );


        if (!id) {


            mostrarMensaje(
                "No se especificó el usuario.",
                "error"
            );


            return;

        }



        /* =================================================
           BUSCAR USUARIO
        ================================================== */

        const usuario =
            obtenerUsuarioPorId(
                id
            );


        if (!usuario) {


            mostrarMensaje(
                "Usuario no encontrado.",
                "error"
            );


            return;

        }



        /* =================================================
           MOSTRAR NOMBRE
        ================================================== */

        const usuarioNombre =
            document.getElementById(
                "usuarioNombre"
            );


        if (usuarioNombre) {

            usuarioNombre.textContent =
                usuario.nombre;

        }



        /* =================================================
           ELEMENTOS
        ================================================== */

        const form =
            document.getElementById(
                "resetPasswordForm"
            );


        const password =
            document.getElementById(
                "password"
            );


        const confirmar =
            document.getElementById(
                "confirmar"
            );


        const message =
            document.getElementById(
                "formMessage"
            );


        const guardarButton =
            document.getElementById(
                "guardarPassword"
            );



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
           FORMULARIO
        ================================================== */

        if (!form) {

            return;

        }


        form.addEventListener(
            "submit",
            event => {


                event.preventDefault();



                /* =========================================
                   LIMPIAR MENSAJE
                ========================================== */

                if (message) {

                    message.style.display =
                        "none";

                }



                /* =========================================
                   OBTENER VALORES
                ========================================== */

                const nuevaPassword =
                    password.value;


                const confirmarPassword =
                    confirmar.value;



                /* =========================================
                   VALIDACIÓN
                ========================================== */

                if (
                    !nuevaPassword ||
                    !confirmarPassword
                ) {


                    mostrarMensaje(
                        "Todos los campos son obligatorios."
                    );


                    return;

                }



                /* =========================================
                   LONGITUD
                ========================================== */

                if (
                    nuevaPassword.length <
                    6
                ) {


                    mostrarMensaje(
                        "La contraseña debe tener al menos 6 caracteres."
                    );


                    return;

                }



                /* =========================================
                   COINCIDENCIA
                ========================================== */

                if (
                    nuevaPassword !==
                    confirmarPassword
                ) {


                    mostrarMensaje(
                        "Las contraseñas no coinciden."
                    );


                    return;

                }



                /* =========================================
                   ESTADO DEL BOTÓN
                ========================================== */

                guardarButton.disabled =
                    true;


                guardarButton.textContent =
                    "Guardando...";



                /* =================================================
                   PUNTO DE INTEGRACIÓN FUTURO
                   
                   AQUÍ irá posteriormente:

                   Firebase Authentication
                   Supabase Auth
                   API
                   etc.
                   
                   NO guardamos la contraseña en
                   localStorage.
                ================================================== */


                console.log(
                    "RESET PASSWORD PENDIENTE DE CONEXIÓN",
                    {
                        usuarioId:
                            usuario.id,

                        usuario:
                            usuario.usuario
                    }
                );



                /* =========================================
                   SIMULACIÓN TEMPORAL
                ========================================== */

                setTimeout(
                    () => {


                        mostrarMensaje(
                            "La contraseña fue actualizada correctamente. La conexión de autenticación se implementará posteriormente.",
                            "success"
                        );


                        guardarButton.disabled =
                            false;


                        guardarButton.textContent =
                            "Guardar Nueva Contraseña";



                        /*
                         * Limpiar campos
                         */

                        password.value =
                            "";


                        confirmar.value =
                            "";



                        /*
                         * Regresar al listado
                         */

                        setTimeout(
                            () => {

                                window.location.href =
                                    "index.html";

                            },
                            1200
                        );


                    },
                    500
                );


            }
        );


    }
);
