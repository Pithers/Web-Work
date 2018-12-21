//myapp/static/js/my_vue.js

//Note: Consider adding delimiters: ['[[',']]'] to the configs so it doesn't need to be typed every time

var app = new Vue({
  delimiters: ['[[',']]'],
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})

var app2 = new Vue({
  el: '#app-2',
  data: {
    message: 'You loaded this page on ' + new Date().toLocaleString()
  }
})

var app3 = new Vue({
  el: '#app-3',
  data: {
    seen: true 
  }
})

var example1 = new Vue({
  delimiters: ['[[',']]'],
  el: '#example-1',
  data: {
    counter: 0
  }
})

var app4 = new Vue({
  delimiters: ['[[',']]'],
  el: '#app-4',
  data: {
    isActive: true
  }
});

var app5 = new Vue({
  delimiters: ['[[',']]'],
  el: '#app-5',
  data: {
    todos: [
      { text: 'Learn JavaScript' },
      { text: 'Learn Vue' },
      { text: 'Build something awesome' }
    ]
  }
})


