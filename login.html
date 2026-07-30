<?php
session_start();
include 'support/config/conexion.php';

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $usuario = $_POST['usuario'];
    $password = md5($_POST['password']);

    $stmt = $conn->prepare("
        SELECT id, usuario, nombre, rol_id
        FROM usuarios
        WHERE usuario = ?
        AND password = ?
        AND estado = 'Activo'
    ");

    $stmt->bind_param("ss", $usuario, $password);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows > 0) {

        $user = $result->fetch_assoc();

        // =========================
        // SESIÓN GLOBAL (UNIFICADA)
        // =========================
       	$_SESSION['id']      = $user['id'];      // compatibilidad módulos antiguos
	$_SESSION['user_id'] = $user['id'];      // módulos nuevos

	$_SESSION['usuario'] = $user['usuario'];
	$_SESSION['nombre']  = $user['nombre'];
	$_SESSION['rol_id']  = $user['rol_id'];

        // =========================
        // ROUTING CENTRAL POR ROL
        // =========================
        $rol = (int)$user['rol_id'];

        $routes = [
    	1 => "support/dashboard/index.php",
    	2 => "support/dashboard/index.php",
    	3 => "rooms/index.php",
    	4 => "rooms_admin/index.php",
    	5 => "cvehicular/admin/index.php",
    	7 => "credencializacion/index.php",
    	8 => "capitalhumano/index.php"
	];

        $destination = $routes[$rol] ?? "index.html";

        header("Location: " . $destination);
        exit();

    } else {
        $error = "Usuario o contraseña incorrectos";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Login Central</title>
<link rel="stylesheet" href="support/css/styles.css">
</head>

<body class="login-body">

<div class="login-container">

    <div class="login-card">

        <div class="login-brand">

            <img 
                src="img/logo1.png"
                alt="Newsroom Portal"
                class="login-logo"
            >

            <h1>Newsroom Portal</h1>

            <p class="subtitle">
                Acceso centralizado al sistema
            </p>

        </div>

        <?php if ($error != ""): ?>
            <div class="error-message">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <form method="POST">

            <input type="text" name="usuario" placeholder="Usuario" required>

            <input type="password" name="password" placeholder="Contraseña" required>

            <button type="submit">Ingresar</button>

            <a href="index.html" class="nav-link-custom home-link">
                <i class="bi bi-house-door-fill"></i>
                Inicio
            </a>

        </form>

    </div>

</div>

</body>
</html>
