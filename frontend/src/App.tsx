import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';

type Project = {
  id: number;
  name: string;
  description: string;
};

type TaskStatus = 'pendiente' | 'completada';

type Task = {
  id: number;
  projectId: number;
  title: string;
  status: TaskStatus;
};

const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Portal interno',
    description: 'Centraliza solicitudes y trabajo diario del equipo.',
  },
  {
    id: 2,
    name: 'Demo Docker Compose',
    description: 'Laboratorio para demostrar frontend, API y base de datos.',
  },
  {
    id: 3,
    name: 'Lanzamiento Q3',
    description: 'Preparativos visuales y operativos para el siguiente ciclo.',
  },
];

const initialTasks: Task[] = [
  { id: 1, projectId: 1, title: 'Definir prioridades semanales', status: 'pendiente' },
  { id: 2, projectId: 1, title: 'Revisar backlog de soporte', status: 'completada' },
  { id: 3, projectId: 2, title: 'Validar persistencia del volumen', status: 'pendiente' },
  { id: 4, projectId: 2, title: 'Crear seed inicial', status: 'pendiente' },
  { id: 5, projectId: 3, title: 'Alinear entregables con diseño', status: 'completada' },
];

function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [nextProjectId, setNextProjectId] = useState(4);
  const [nextTaskId, setNextTaskId] = useState(6);

  const toggleTaskStatus = (taskId: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'pendiente' ? 'completada' : 'pendiente' }
          : task,
      ),
    );
  };

  const createProject = (name: string, description: string) => {
    setProjects((currentProjects) => [
      { id: nextProjectId, name, description },
      ...currentProjects,
    ]);
    setNextProjectId((currentValue) => currentValue + 1);
  };

  const createTask = (projectId: number, title: string) => {
    setTasks((currentTasks) => [
      ...currentTasks,
      { id: nextTaskId, projectId, title, status: 'pendiente' },
    ]);
    setNextTaskId((currentValue) => currentValue + 1);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,#07111f_0%,#0b1728_55%,#07111f_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/90">SPA demo</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Gestor de proyectos y tareas</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Dos vistas, navegación real y estado local para demostrar el flujo principal del laboratorio.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Sin login, sin roles, sin paginación.
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <ProjectListPage
                  projects={projects}
                  tasks={tasks}
                  isNewProjectOpen={isNewProjectOpen}
                  onToggleNewProject={() => setIsNewProjectOpen((value) => !value)}
                  onCreateProject={createProject}
                />
              }
            />
            <Route
              path="/proyectos/:id"
              element={
                <ProjectTasksPage
                  projects={projects}
                  tasks={tasks}
                  onCreateTask={createTask}
                  onToggleTaskStatus={toggleTaskStatus}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function ProjectListPage({
  projects,
  tasks,
  isNewProjectOpen,
  onToggleNewProject,
  onCreateProject,
}: {
  projects: Project[];
  tasks: Task[];
  isNewProjectOpen: boolean;
  onToggleNewProject: () => void;
  onCreateProject: (name: string, description: string) => void;
}) {
  const projectTaskCounts = useMemo(
    () =>
      projects.reduce<Record<number, number>>((accumulator, project) => {
        accumulator[project.id] = tasks.filter((task) => task.projectId === project.id).length;
        return accumulator;
      }, {}),
    [projects, tasks],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Lista de proyectos</h2>
          <p className="mt-1 text-sm text-slate-400">Cada tarjeta lleva a su lista de tareas.</p>
        </div>
        <button
          type="button"
          onClick={onToggleNewProject}
          className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          + Nuevo proyecto
        </button>
      </div>

      {isNewProjectOpen ? <NewProjectForm onCreateProject={onCreateProject} /> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Proyecto</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{project.name}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {projectTaskCounts[project.id] ?? 0} tareas
              </span>
            </div>

            <p className="mb-6 text-sm leading-6 text-slate-300">{project.description}</p>

            <div className="mt-auto flex items-center justify-between gap-3">
              <Link
                to={`/proyectos/${project.id}`}
                className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Ver tareas
              </Link>
              <span className="text-xs text-slate-500">ID {project.id}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NewProjectForm({ onCreateProject }: { onCreateProject: (name: string, description: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      return;
    }

    onCreateProject(trimmedName, trimmedDescription);
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-lg shadow-cyan-950/20">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Nombre del proyecto</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Portal de soporte"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm font-medium text-slate-200">Descripción</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción corta"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="submit"
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Crear proyecto
        </button>
      </div>
    </form>
  );
}

function ProjectTasksPage({
  projects,
  tasks,
  onCreateTask,
  onToggleTaskStatus,
}: {
  projects: Project[];
  tasks: Task[];
  onCreateTask: (projectId: number, title: string) => void;
  onToggleTaskStatus: (taskId: number) => void;
}) {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = Number(params.id);
  const project = projects.find((currentProject) => currentProject.id === projectId);
  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  if (!project || Number.isNaN(projectId)) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-center shadow-2xl shadow-black/20">
        <h2 className="text-2xl font-semibold text-white">Proyecto no encontrado</h2>
        <p className="mt-2 text-sm text-slate-400">No existe un proyecto con ese identificador.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950"
        >
          ← Volver
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            ← Volver
          </button>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Proyecto seleccionado</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{project.name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{project.description}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          {projectTasks.length} tareas registradas
        </div>
      </div>

      <div className="space-y-4">
        {projectTasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-slate-400">
            No hay tareas todavía. Agrega la primera desde el formulario inferior.
          </div>
        ) : (
          projectTasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Tarea</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{task.title}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    task.status === 'completada'
                      ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20'
                      : 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/20'
                  }`}
                >
                  {task.status}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleTaskStatus(task.id)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Alternar estado
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <TaskForm projectId={project.id} onCreateTask={onCreateTask} />
    </section>
  );
}

function TaskForm({ projectId, onCreateTask }: { projectId: number; onCreateTask: (projectId: number, title: string) => void }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    onCreateTask(projectId, trimmedTitle);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
      <h3 className="text-lg font-semibold text-white">Agregar una tarea nueva</h3>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título de la tarea"
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
        />
        <button
          type="submit"
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Agregar tarea
        </button>
      </div>
    </form>
  );
}

export default App;