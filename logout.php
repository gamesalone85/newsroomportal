<?php

session_start();

// limpiar variables de sesión
$_SESSION = [];

// destruir sesión
session_destroy();

// redirigir a login
header("Location: /newsroomportal/login.php");
exit;
