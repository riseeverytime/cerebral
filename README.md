# function-tree

When a function is not enough

### What is it?
Readable and maintainable code is a never ending quest. With the increased complexity of modern web applications the execution of code from user interactions and other events in our applications has increased in complexity as well. But this is not only related to the frontend, also our backends has increased execution complexity as our applications are inherently more complex.

Callback hell is a common term which says something about how asynchronous code execution affects readability and maintainability of our code bases. Even with promises we can get readability issues with conditional execution flow. Callbacks and promises aside, the testability and reusability of code is also an important factor which is difficult to achieve in general.

A function tree will help you execute synchronous and asynchronous functions in a declarative, composable and testable way. **Declarative** means that you can describe an execution without writing any implementation, increasing readability of the code. **Composable** means that some part of one execution can be reused in an other execution. And **testable** means that you will write your code in a way where the whole chain of execution and its individual parts can be tested.

We often talk about pure functions as the holy grail for giving our code these attributes. But pure functions means "no side effects" which is contradictory to a lot of the code we write. Everything from manipulating the DOM, talking to the server, even changing the state of our apps is *side effects*. **function-tree** does not push side effects to the edge of your app. The execution runs exactly how you think about it, one step after the other, but keeps the important traits of pure functions. Writing **Declarative, composable and testable** code. You can conceptually think of a function tree as a decision tree, which is a great way to build mental images of complex scenarios and their possible outcomes.

### Demo
Install the [chrome extension debugger](https://chrome.google.com/webstore/detail/function-tree-debugger/ppfbmcnapdgakfiocieggdgbhmlalgjp). Clone this repo, install deps and run:

`npm run demo:redux`

More demos coming soon...

### A small example
A typical function with side effects.

```js
function getData(url) {
  axios.get(url)
    .then((result) => {
      window.app.data = result.data
    })
    .catch((err) => {
      window.app.error = err;
    })
}
```

A function tree can be used in many domains. It being frontend application events, handle routing on your web server, tasks from a queue or other processes. You will need to define what a function tree should have access to, but before looking into that, lets look at how the previous function could be defined:

```js
[
  getData, {
    success: [
      setData
    ],
    error: [
      setError
    ]
  }
]
```

As you can see the function tree has no implementation details. And this is what we mean by **declarative** approach. It is an abstraction that describes what should happen, not how. And this is an important distinction to uphold readability. There are no distractions in this code, you instantly understand what it does. It is also **composable** because any of the functions referenced in the function tree can be inserted into any other function tree. You could even compose in a whole tree into another using the spread operator:

```js
[
  ...doThis,
  ...doThat
]
```

But what about testability? You would have a very hard time creating a test for the first function we wrote above. Let us explore how the functions in a function tree run.

```js
import execute from './execute'

function getData(context) {
  return context.request('/data')
    .then(context.result.success)
    .catch(context.result.error)
}

function setData(context) {
  context.window.app.data = context.input.result
}

function setError(context) {
  context.window.app.error = context.input.error
}

execute([
  getData, {
    success: [
      setData
    ],
    error: [
      setError
    ]
  }
])
```

Our functions, in spite of them doing side effects, are now testable. They are testable because the functions only operates on the **context** argument, which means during a test you can mock it.

All applications needs to define one or more definitions of how these function trees should run. In the example above we have a file called **execute**. We could have called it **run**, **trigger** or whatever else you would prefer. The point is that this function is what executes trees with a **context** you have defined. Let us look into our execute file:

```javascript
import FunctionTree from 'function-tree'
import DebuggerProvider from 'function-tree/providers/DebuggerProvider'
import ContextProvider from 'function-tree/providers/ContextProvider'
import request from 'request'

export default new FunctionTree([
  DebuggerProvider(),
  ContextProvider({
    request,
    window
  })
])
```

Creating the execute function lets us extend the default context. We extend it with *window* and *request*. We do this simply because we want to use them. The context is available to all the functions of the function tree. By default **input** and **result** is already defined. **Input** holds the current payload. **Result** is a function that builds an object you optionally return from the function. This returned object describes what payload to pass on to the next function and if any path should be executed. When the function returns a promise it will wait for the promise to resolve before moving on. You can also use ES7 async functions to do the same.

### How does this differ from rxjs and promises?
Both Rxjs and Promises are about execution control, but neither of them have declarative conditional execution paths, you have to write an *IF* or *SWITCH* statement. The example above we were able to diverge our execution down the `success` or `error` path just as declaratively as our functions. This helps readability. Conditional execution can also be related to things like:

```js
[
  withUserRole, {
    admin: [],
    superuser: [],
    user: []
  }
]
```

Here we create a function that will diverge execution based on the user role.

Rxjs and Promises are also based on value transformation. That means only the value returned from the previous function is available in the next. This works when you indeed want to transform values, but events in your application are rarely about value transformation, they are about running side effects and going through one of multiple execution paths. And that is where **function-tree** differs. It embraces the fact that most of what we do in application development is running side effects.

### Factories and composing
When you have a declarative approach the concept of factories and composition becomes very apparent. For example doing a request could be a factory using:

```js
[
  httpGet('/users'), {
    success: [],
    error: []
  }
]
```

Or maybe you have a notification system:

```js
[
  notify('Loading data'),
  httpGet('/users'), {
    success: [
      notify('Data loaded')
    ],
    error: [
      notify('Could not load data')
    ]
  }
]
```

We are already composing in functions here, but you can also compose in other trees.

```js
const getUsers = [
  httpGet('/users'), {
    success: [],
    error: []
  }
]

const loadApp = [
  ...getUsers,
  ...getNotifications,
  ...getConfig
]
```

Or you could run these three trees in parallel using an array to group them together:

```js
const loadApp = [
  [
    ...getUsers,
    ...getNotifications,
    ...getConfig
  ]
]
```

### What happens when a function tree executes?
When you execute a function tree it will traverse the tree verifying its validity and analyzing the different execution paths. This gives a static representation of the tree which can be accessed by providers and can also be passed to debuggers to visualize it. The analysis is cached, so it only happens the first time. Then the tree will be traversed, creating a context for every function before executing it. When the function is done running it continues to the next function.

The fact that a context is created for each function gives a lot of flexibility. You can configure your function trees to handle everything from Redux dispatchers, to firebase, mobx models, ember data, mongodb on the server etc. It does not matter, function tree is completely agnostic to this.

### Testing
Testing functions used in a function tree is as simple as just calling them and provide a context. For example:

```js
function setData(context) {
  context.window.app.data = context.input.result
}
```

The test would be:

```js
const mockedWindow = { app: {}}
setData({
  input: {result: 'foo'},
  window: mockedWindow
})

test.deepEqual(mockedWindow, {app: {data: 'foo'}})
```

When you want to test the whole function tree execution you can do:

```js
const FunctionTree = require('function-tree')
const ContextProvider = require('function-tree/providers/Context')
const appMounted = require('../src/events/appMounted')

const window = {app: {}}
const execute = new FunctionTree([
  ContextProvider({
    window,
    request: {
      get() {
        return new Promise(resolve => (
          resolve({status: 200, data: {foo: 'bar'}})
        ))
      }
    }
  })
])

execute(appMounted, () => {
  test.deepEquals(window, {app: {data: 'foo'}})
})

```

### API

#### Create an execution function

```js
import FunctionTree from 'function-tree'

const execute = new FunctionTree([
  // Providers
])

export default execute;
```

#### Extending the context

```js
import FunctionTree from 'function-tree'
import ContextProvider from 'function-tree/providers/Context'
import request from 'request'

const execute = new FunctionTree([
  ContextProvider({
    request
  })
])

export default execute;
```

#### Execute a tree
By convention you should define the trees in their own file. There are no dependencies to creating a tree. It is just an array with functions.

```js
export default [
  funcA, {
    success: [
      funcB
    ],
    error: [
      funcC
    ]
  }
]
```

At the point where you actually want to execute you bring the tree and the application execute function together.

```js
import execute from './execute'
import tree from './tree'

execute(tree)
```

#### Passing an initial payload (input)
```js
import execute from './execute'
import tree from './tree'

execute(tree, {
  foo: 'bar'
})
```

#### Providers
A provider gives you access to the current context and other information about the execution. It is required that you return the context or a mutated version of it.

```js
import FunctionTree from 'function-tree'

const execute = new FunctionTree([
  function MyProvider(context, functionDetails, payload) {
    context // Current context
    context.input // Input created by the InputProvider (default)
    context.result // Result created by the ResultProvider (default)

    payload // The current payload (Used by InputProvider)

    functionDetails.name // Name of the function
    functionDetails.functionIndex // The index of the function in the tree, like an ID
    functionDetails.function // A reference to the running function

    context._instance.name // Function tree id
    context._instance.executionId // Current execution id
    context._instance.staticTree // The static representation of the tree
    context._instance.datetime // Time of execution

    return context // Always return the changed context
  }
])
```

Providers lets us do some pretty amazing things. The debugger for **function-tree** is actually just a provider that sends information to the debugger about execution and exposes an API for other providers to send their own data to the debugger.

#### Input (default provider)

```js
import FunctionTree from 'function-tree'

function funcA(context) {
  context.input.foo // "bar"
}

const execute = new FunctionTree()
const tree = [
  funcA
]

execute(tree, {foo: 'bar'})
```

#### Result (default provider)

```js
import FunctionTree from 'function-tree'

function funcA(context) {
  context.input.foo // "bar"
  return context.result.pathA({foo2: 'bar2'})
}

function funcB(context) {
  context.input.foo // "bar"
  context.input.foo2 // "bar2"

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(context.result({foo3: 'bar3'}))
    }, 100)
  })
}

function funcC(context) {
  context.input.foo // "bar"
  context.input.foo2 // "bar2"
  context.input.foo3 // "bar3"
}

const execute = new FunctionTree([])
const tree = [
  funcA, {
    pathA: [
      funcB,
      funcC
    ],
    pathB: []
  }
]

execute(tree, {foo: 'bar'})
```

#### Context (optional provider)
Will extend the context. If the debugger is active the methods on the attached object will be wrapped and debugger till notify about their uses.

```js
import FunctionTree from 'function-tree'
import ContextProvider from 'function-tree/providers/Context'
import request from 'request'

function funcA(context) {
  context.request
  context.request.get('/whatever') // Debugger will know about this
}

const execute = new FunctionTree([
  ContextProvider({
    request
  })
])
const tree = [
  funcA
]

execute(tree, {foo: 'bar'})
```

#### Debugger (optional provider)
Download the [Chrome Extension](https://chrome.google.com/webstore/detail/function-tree-debugger/ppfbmcnapdgakfiocieggdgbhmlalgjp).

```js
import FunctionTree from 'function-tree'
import DebuggerProvider from 'function-tree/providers/Debugger'
import ContextProvider from 'function-tree/providers/Context'
import request from 'request'

const execute = new FunctionTree([
  DebuggerProvider({
    colors: {
      request: 'red' // Set color of usage in debugger
    }
  }),
  ContextProvider({
    request
  })
])
```

#### NodeDebugger (optional provider)

```js
const FunctionTree = require('function-tree')
const NodeDebuggerProvider = require('function-tree/providers/NodeDebugger')
const ContextProvider = require('function-tree/providers/Context')
const request = require('request')

const execute = new FunctionTree([
  NodeDebuggerProvider({
    colors: {
      request: 'red' // Set color of usage in debugger
    }
  }),
  ContextProvider({
    request
  })
])
```

#### Events
The execute function is also an event emitter.

```js
import FunctionTree from 'function-tree'

const execute = new FunctionTree([])
const tree = [
  funcA
]

// When a function tree is executed
execute.on('start', (execution, payload) => {})

// When a function tree ends its execution
execute.on('end', (execution, payload) => {})

// When a function in a function tree starts executing
execute.on('functionStart', (execution, payload, functionDetails) => {})

// When a function in a function tree stops executing
execute.on('functionEnd', (execution, payload, functionDetails) => {})

execute(tree)
```
