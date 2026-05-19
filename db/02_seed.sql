INSERT INTO projects (name, description)
VALUES
  ('Proyecto Atlas', 'Proyecto interno para organizar tareas del equipo.'),
  ('Proyecto Aurora', 'Tablero simple de tareas para la demo.');

INSERT INTO tasks (project_id, title, status)
VALUES
  (1, 'Definir alcance del MVP', 'pendiente'),
  (1, 'Preparar demo de Docker Compose', 'completada'),
  (1, 'Revisar endpoints de la API', 'pendiente'),
  (2, 'Disenar UI basica', 'pendiente'),
  (2, 'Crear tareas iniciales', 'completada'),
  (2, 'Validar persistencia de datos', 'pendiente');

INSERT INTO members (name, email)
VALUES
  ('Sofia Ramos', 'sofia.ramos@example.com'),
  ('Diego Perez', 'diego.perez@example.com'),
  ('Carla Torres', 'carla.torres@example.com');

INSERT INTO task_assignments (task_id, member_id)
VALUES
  (1, 1),
  (2, 2),
  (4, 3);
