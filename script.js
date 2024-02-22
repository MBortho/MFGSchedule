function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.dataset.id);
}

function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  const draggableElement = document.querySelector(`.order[data-id="${data}"]`);
  const dropzone = event.target.closest('.drop-area');
  if (draggableElement && dropzone) {
    dropzone.appendChild(draggableElement);
    draggableElement.removeAttribute("draggable");
  }
}
