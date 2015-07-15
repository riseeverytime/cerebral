let saveTodo = function (args, state, promise) {

  let todo = state.get('todos', args.ref);

  // Simulating posting the todo.data and get an ID from
  // the server. We resolve with the new id and the ref
  console.log('saving');
  setTimeout(function () {

    promise.resolve({
      id: Date.now() + parseInt(Math.random() * 1000)
    });

  }, 1000);

};

export default saveTodo;
