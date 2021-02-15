let todoItems = [];
const container = document.querySelector('.container');


// Render todos on the screen
function renderTodo(todo) {
  // Persist application state to local storage
  localStorage.setItem('todoItems', JSON.stringify(todoItems));

  const list = document.querySelector('.js-todo-list');
  const item = document.querySelector(`[data-key='${todo.id}']`);
  
  if (todo.deleted) {
    item.remove();
    // Clear whitespace from list container when `todoItems` is empty
    if (todoItems.length === 0) list.innerHTML = '';
    return
  }

  // Use the ternary operator to check if `todo.checked` is true
  // if so, assign 'done' to `isChecked`. Otherwise, assign an empty string
  const isChecked = todo.checked ? 'done': '';
  const node = document.createElement("li");
  node.setAttribute('class', `todo-item droppable ${isChecked}`);
  node.setAttribute('data-key', todo.id);
  node.setAttribute('draggable', true);
  node.innerHTML = `
    <input id="${todo.id}" type="checkbox"/>
    <label for="${todo.id}" class="tick js-tick"></label>
    <span>${todo.text}</span>
    <button class="delete-todo js-delete-todo">
    <svg><use href="#delete-icon"></use></svg>
    </button>
  `;

  // If item already exists in the DOM, replace it
  if (item) {
    list.replaceChild(node, item);
  } else {
    // else, append it to the end of the list
    list.append(node);
  }

  // Drag and drop items using SortableJS library
  const sortable = Sortable.create(list);
}


// Add a new todo
function addTodo(text) {
  const todo = {
    text,
    checked: false,
    id: Date.now(),
  };

  //Fetch request to add todo to database
  fetch('/add-todo', {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.text());
    }
    return response.text()
  })
  .then(text => {
    todoItems.push(todo);
    renderTodo(todo);
  })
  .catch(err => {
    alert(err);
  }) 
}


// Mark todo as done
function toggleDone(key) {
  // Find the corresponding todo object in the todoItems array
  const index = todoItems.findIndex(item => item.id === Number(key));
  todoItems[index].checked = !todoItems[index].checked;
  renderTodo(todoItems[index]);

  const todo = todoItems[index];

  // Fetch request to mark todo as done in database
  fetch('/mark-checked', {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.text());
    }
    return response.text();
  })
  .then(text => {
    todoItems.push(todo);
    renderTodo(todo);
    console.log(text);
  })
  .catch(err => {
    alert(err);
  }) 
}


// Delete todo
function deleteTodo(key) {
  // Find the corresponding todo object in the todoItems array
  const index = todoItems.findIndex(item => item.id === Number(key));

  // Create a new object with properties of the current todo item
  // and a `deleted` property which is set to true
  const todo = {
    deleted: true,
    ...todoItems[index]
  };
  // Remove the todo item from the array by filtering it out
  todoItems = todoItems.filter(item => item.id !== Number(key));

  //Fetch request for deletion of todo item from database
  fetch('/delete-todo', {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.text());
    }
    return response.text();
  })
  .then(text => {
    renderTodo(todo);
  })
  .catch(err => {
    alert(err);
  })
}


// Render existing todo items when page is reloaded
document.addEventListener('DOMContentLoaded', () => {
  const ref = localStorage.getItem('todoItems');
  if (ref) {
    todoItems = JSON.parse(ref);
    todoItems.forEach(t => {
      renderTodo(t);
    });
  }
});


// Create a new todo item and reset input field
const form = document.querySelector('.js-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('.js-todo-input');

  // Remove whitespace from beginning and end of text input
  const text = input.value.trim();
  if (text !== '') {
    addTodo(text);
    input.value = '';
    input.focus();
  }
});


// Check or delete todo items
const list = document.querySelector('.js-todo-list');
list.addEventListener('click', event => {
  // If clicked element is a checkbox
  if (event.target.classList.contains('js-tick')) {
    // Get the data-key of its parent element and pass it to toggleDone
    const itemKey = event.target.parentElement.dataset.key;
    toggleDone(itemKey);
  }
  
  // If element clicked is a delete button
  if (event.target.classList.contains('js-delete-todo')) {
    const itemKey = event.target.parentElement.dataset.key;
    deleteTodo(itemKey);
  }
});
