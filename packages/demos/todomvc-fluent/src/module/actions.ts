import { Context, ContextWithPaths } from '../globals';

export function redirectToAll ({ router }: Context) {
  router.redirect('/all');
}

export function changeNewTodoTitle ({ state, props }: Context<{ title: string }>) {
  state.newTodoTitle = props.title;
}

export function removeTodo ({ state, props }: Context<{ uid: string }>) {
  state.todos.delete(props.uid);
}

export function toggleAllChecked ({ state }: Context) {
  const isAllChecked = state.isAllChecked;
  state.visibleTodosUids.forEach(uid => {
    const todo = state.todos.get(uid);

    if (todo) {
      todo.completed = isAllChecked;
    }
  });
}

export function toggleTodoCompleted ({ state, props }: Context<{ uid: string }>) {
  const todo = state.todos.get(props.uid);
  if (todo) {
    todo.completed = !todo.completed;
  }
}

export function clearCompletedTodos({ state }: Context) {
  state.todos.keys().forEach(uid => {
    const todo = state.todos.get(uid);

    if (todo && todo.completed) {
      state.todos.delete(uid);
    }
  });
}

export function changeFilter({ state, props }: Context<{ filter: string }>) {
  state.filter = props.filter;
}

export function hasNewTodoTitle ({ state, path}: ContextWithPaths<void, { true: {}, false: {} }>) {
  if (state.newTodoTitle) {
    return path.true({});
  }

  return path.false({});
}

export function addTodo ({ state, props, id }: Context) {
  state.todos.set(id.create(), {
    title: state.newTodoTitle,
    completed: false,
    editedTitle: state.newTodoTitle
  });
}

export function clearTodoTitle ({ state }: Context) {
  state.newTodoTitle = '';
}

export function changeTodoTitle ({ state, props }: Context<{ uid: string, title: string }>) {
  const todo = state.todos.get(props.uid);
  if (todo) {
    todo.editedTitle = props.title;
  }
}

export function editTodo ({ state, props }: Context<{ uid: string }>) {
  const todo = state.todos.get(props.uid);
  if (todo) {
    todo.editedTitle = todo.title;
    state.editingUid = props.uid;
  }
}

export function abortEditingTodo ({ state, props }: Context<{ uid: string }>) {
  const todo = state.todos.get(props.uid);
  if (todo) {
    todo.editedTitle = '';
    state.editingUid = null;
  }
}

export function whenEditedTitle ({ state, props, path }: ContextWithPaths<{ uid: string }, { true: {}, false: {} }>) {
  const todo = state.todos.get(props.uid);
  if (todo && todo.editedTitle) {
    return path.true({});
  }

  return path.false({});
}

export function updateTodoTitle ({ state, props }: Context<{ uid: string }>) {
  const todo = state.todos.get(props.uid);
  if (todo) {
    todo.title = todo.editedTitle;
    todo.editedTitle = '';
    state.editingUid = null;
  }
}