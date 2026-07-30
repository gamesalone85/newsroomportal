<?php

include 'config/db.php';

function e($str){
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

$id = intval($_GET['id'] ?? 0);

$sql = "

SELECT

i.*,
r.asunto,
s.nombre AS sala

FROM incidencias_salas i

LEFT JOIN reservas_salas r
ON i.reserva_id = r.id

LEFT JOIN salas s
ON r.sala_id = s.id

WHERE i.id = $id

LIMIT 1
";

$data = $conn->query($sql)->fetch_assoc();

if(!$data){
    exit('Incidencia no encontrada');
}

/* =========================================
   COMENTARIOS
========================================= */

$comments = $conn->query("
SELECT *
FROM incidencias_comentarios
WHERE incidencia_id = $id
ORDER BY fecha DESC
");

?>

<div class="incident-grid">

    <div class="incident-info">

        <div class="incident-meta">

            <div class="meta-card">
                <span>Folio</span>
                <strong><?= e($data['folio']) ?></strong>
            </div>

            <div class="meta-card">
                <span>Sala</span>
                <strong><?= e($data['sala']) ?></strong>
            </div>

            <div class="meta-card">
                <span>Tipo</span>
                <strong><?= e($data['tipo']) ?></strong>
            </div>

            <div class="meta-card">
                <span>Estatus</span>
                <strong><?= e($data['estatus']) ?></strong>
            </div>

        </div>

        <div class="detail-section">

            <h3>Descripción</h3>

            <p>
                <?= nl2br(e($data['descripcion'])) ?>
            </p>

        </div>

        <?php if($data['evidencia']): ?>

        <div class="detail-section">

            <h3>Evidencia</h3>

            <img
                src="<?= e($data['evidencia']) ?>"
                class="incident-image"
            >

        </div>

        <?php endif; ?>

    </div>

    <div class="incident-comments">

        <div class="comments-header">

            <h3>Comentarios internos</h3>

        </div>

        <div class="comments-list">

            <?php if($comments->num_rows > 0): ?>

                <?php while($c = $comments->fetch_assoc()): ?>

                    <div class="comment-item">

                        <div class="comment-top">

                            <strong>
                                <?= e($c['creado_por']) ?>
                            </strong>

                            <small>
                                <?= date('d/m/Y H:i', strtotime($c['fecha'])) ?>
                            </small>

                        </div>

                        <p>
                            <?= nl2br(e($c['comentario'])) ?>
                        </p>

                    </div>

                <?php endwhile; ?>

            <?php else: ?>

                <div class="empty-comments">
                    No hay comentarios registrados.
                </div>

            <?php endif; ?>

        </div>

        <form
            class="comment-form"
            method="POST"
            action="guardar_comentario.php"
        >

            <input
                type="hidden"
                name="incidencia_id"
                value="<?= $id ?>"
            >

            <textarea
                name="comentario"
                placeholder="Agregar comentario interno..."
                required
            ></textarea>

            <button type="submit">
                Guardar comentario
            </button>

        </form>

    </div>

</div>
