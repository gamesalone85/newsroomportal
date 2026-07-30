/* =========================================================
   NEWSROOM PORTAL
   SIDEBAR CONTROLLER
   =========================================================

   Archivo:
   support/js/sidebar.js

   Funciones:

   - Cargar sidebar.html
   - Controlar permisos por rol
   - Abrir/cerrar submenús
   - Contraer sidebar
   - Detectar página actual
   - Abrir automáticamente el grupo activo
   - Cerrar sesión

   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    async () => {


        /* =================================================
           CONTENEDOR DEL SIDEBAR
        ================================================== */

        const container =
            document.getElementById(
                "sidebarContainer"
            );


        if (!container) {

            console.error(
                "Newsroom Portal: No existe #sidebarContainer"
            );

            return;

        }



        /* =================================================
           CARGAR SIDEBAR.HTML
        ================================================== */

        try {


            const response =
                await fetch(
                    "../includes/sidebar.html"
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const html =
                await response.text();


            container.innerHTML =
                html;


        } catch (error) {


            console.error(
                "Newsroom Portal: No fue posible cargar sidebar.html",
                error
            );


            return;

        }



        /* =================================================
           ELEMENTOS DEL SIDEBAR
        ================================================== */

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const toggle =
            document.getElementById(
                "sidebarToggle"
            );


        const logoutLink =
            document.getElementById(
                "logoutLink"
            );



        /* =================================================
           OBTENER SESIÓN
        ==================================================

           auth.js debe cargarse antes que sidebar.js.

        ================================================== */

        let session = null;


        if (
            typeof obtenerSesion ===
            "function"
        ) {

            session =
                obtenerSesion();

        }



        /* =================================================
           DETERMINAR ROL
        ================================================== */

        const rol =
            session
                ? Number(session.rol_id)
                : null;



        /* =================================================
           CONTROL DE ELEMENTOS POR ROL
        ==================================================

           Ejemplo:

           data-role="1"

           Solo aparece para rol 1.

        ================================================== */

        document
            .querySelectorAll(
                "[data-role]"
            )
            .forEach(element => {


                const requiredRole =
                    Number(
                        element.dataset.role
                    );


                /*
                 * Si no existe sesión,
                 * ocultamos el elemento.
                 */

                if (!session) {

                    element.style.display =
                        "none";

                    return;

                }


                /*
                 * Si el rol no coincide,
                 * ocultamos el elemento.
                 */

                if (
                    rol !== requiredRole
                ) {

                    element.style.display =
                        "none";

                }

            });



        /* =================================================
           CONTRAER / EXPANDIR SIDEBAR
        ================================================== */

        if (toggle && sidebar) {


            toggle.addEventListener(
                "click",
                () => {


                    sidebar.classList.toggle(
                        "collapsed"
                    );


                    /*
                     * Guardamos la preferencia
                     * del usuario.
                     */

                    const collapsed =
                        sidebar.classList.contains(
                            "collapsed"
                        );


                    localStorage.setItem(
                        "newsroomSidebarCollapsed",
                        collapsed
                    );

                }
            );


        }



        /* =================================================
           RESTAURAR ESTADO DEL SIDEBAR
        ================================================== */

        if (sidebar) {


            const savedState =
                localStorage.getItem(
                    "newsroomSidebarCollapsed"
                );


            if (
                savedState === "true"
            ) {

                sidebar.classList.add(
                    "collapsed"
                );

            }

        }



        /* =================================================
           MENÚS DESPLEGABLES
        ================================================== */

        document
            .querySelectorAll(
                ".nav-group"
            )
            .forEach(group => {


                const button =
                    group.querySelector(
                        ".nav-dropdown-btn"
                    );


                if (!button) {

                    return;

                }


                button.addEventListener(
                    "click",
                    () => {


                        /*
                         * Si el sidebar está
                         * contraído no abrimos
                         * submenús.
                         */

                        if (
                            sidebar &&
                            sidebar.classList.contains(
                                "collapsed"
                            )
                        ) {

                            return;

                        }


                        group.classList.toggle(
                            "open"
                        );

                    }
                );


            });



        /* =================================================
           DETECTAR PÁGINA ACTUAL
        ================================================== */

        const pathname =
            window.location.pathname;


        let currentFile =
            pathname
                .split("/")
                .pop()
                .toLowerCase();


        /*
         * Si estamos en:

         * /admin/
         *
         * o
         *
         * /admin/index.html
         *
         * lo consideramos "admin".
         */

        if (
            !currentFile ||
            currentFile === "index.html"
        ) {


            const folders =
                pathname
                    .split("/")
                    .filter(Boolean);


            const currentFolder =
                folders.length > 1
                    ? folders[folders.length - 2]
                    : "";


            currentFile =
                currentFolder
                    .toLowerCase();

        } else {


            currentFile =
                currentFile
                    .replace(
                        ".html",
                        ""
                    );

        }



        /* =================================================
           MARCAR OPCIÓN ACTIVA
        ================================================== */

        document
            .querySelectorAll(
                "[data-page]"
            )
            .forEach(link => {


                const page =
                    String(
                        link.dataset.page || ""
                    )
                    .toLowerCase();


                if (
                    page === currentFile
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            });



        /* =================================================
           ABRIR AUTOMÁTICAMENTE EL GRUPO ACTIVO
        ================================================== */

        document
            .querySelectorAll(
                ".nav-group"
            )
            .forEach(group => {


                const active =
                    group.querySelector(
                        ".active"
                    );


                if (active) {

                    group.classList.add(
                        "open"
                    );

                }

            });



        /* =================================================
           CERRAR SESIÓN
        ================================================== */

        if (logoutLink) {


            logoutLink.addEventListener(
                "click",
                event => {


                    event.preventDefault();


                    const confirmar =
                        confirm(
                            "¿Deseas cerrar la sesión?"
                        );


                    if (!confirmar) {

                        return;

                    }



                    /* =========================================
                       UTILIZAR AUTH.JS
                    ========================================= */

                    if (
                        typeof cerrarSesion ===
                        "function"
                    ) {

                        cerrarSesion();


                        return;

                    }



                    /* =========================================
                       RESPALDO
                    =========================================

                       Si auth.js no está disponible,
                       cerramos manualmente la sesión.

                    ========================================= */

                    localStorage.removeItem(
                        "newsroomSession"
                    );


                    window.location.href =
                        "../../login.html";


                }
            );

        }



        /* =================================================
           FIN
        ================================================== */

        console.log(
            "Newsroom Portal: Sidebar cargado correctamente."
        );


    }
);
