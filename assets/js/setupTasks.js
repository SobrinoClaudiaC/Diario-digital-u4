import {
  createTask,
  onGetTask,
  deleteTask,
  updateTask,
  getTask,
} from "./firebase.js";
import { showMessage } from "./toastMessage.js";

const taskForm = document.querySelector("#task-form");
const tasksContainer = document.querySelector("#tasks-container");

// Variables para la edición
let editStatus = false;
let editId = "";

export const setupTasks = () => {
  //CREATE
  taskForm.addEventListener("submit", async (e) => {
    // Prevenir que la página se recargue
    e.preventDefault();

    // Obtener los datos del formulario
    const title = taskForm["title"].value;
    const description = taskForm["description"].value;

    // Crear y/o editar una nueva tarea
    try {
      if (!editStatus) {
        // Crear tarea
        await createTask(title, description);
        // Mostrar mensaje de éxito
        showMessage("Tarea creada", "success");
      } else {
        // Actualizar tarea
        await updateTask(editId, { title, description });
        // Mostrar mensaje de éxito
        showMessage("Tarea actualizada", "success");

        // Cambiar el estado de edición
        editStatus = false;
        // Cambiar  el id de edición
        editId = "";

        // Modificamos lo que muestra el formulario
        document.getElementById("form-title").innerHTML =
          "Agregar una nueva tarea";
        taskForm["btn-agregar"].value = "Crear tarea";
      }

      // Limpiar el formulario
      taskForm.reset();
    } catch (error) {
      // Mostrar mensaje de error
      showMessage(error.code, "error");
    }
  });

  // READ
  onGetTask((querySnapshot) => {
    let tasksHtml = "";

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      tasksHtml += `
      <article class="task-container border border-2 rounded-2 p-3 my-3">
        <header class="d-flex justify-content-between">
          <h4>${data.title}</h4>
          <div>
            <button class="btn btn-info btn-editar" data-id="${doc.id}"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn btn-danger btn-eliminar" data-id="${doc.id}"><i class="bi bi-trash3-fill"></i></button>
          </div>
        </header>
        <hr />
        <p>${data.description}</p>
      </article>
      `;
    });

    // Mostrar las tareas en el DOM
    tasksContainer.innerHTML = tasksHtml;

    // Todo: C R U D
    // *Update
    // Obtenemos los botones de editar
    const btnsEditar = document.querySelectorAll(".btn-editar");
    // Iteramos sobre cada botón
    btnsEditar.forEach((btn) => {
      btn.addEventListener("click", async ({ target: { dataset } }) => {
        // Obtenemos el documento
        const doc = await getTask(dataset.id);
        // Obtenemos los datos
        const task = doc.data();

        // Llenamos el formulario con los datos
        taskForm["title"].value = task.title;
        taskForm["description"].value = task.description;
        // Actualizamos el estado de edición y el id edición
        editStatus = true;
        editId = doc.id;
        // Cambiamos lo que muestra el formulario
        document.getElementById("form-title").innerHTML = "Editar tarea";
        taskForm["btn-agregar"].value = "Guardar cambios";
      });
    });

    // !Delete
    // Obtenemos todos los botones
    const btnsEliminar = document.querySelectorAll(".btn-eliminar");

    // Iteramos sobre cada botón
    btnsEliminar.forEach((btn) => {
      btn.addEventListener("click", ({ target: { dataset } }) => {
        deleteTask(dataset.id);
        showMessage("Tarea eliminada", "success");
      });
    });
  });
};
