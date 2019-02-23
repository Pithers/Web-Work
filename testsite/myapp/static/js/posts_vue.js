//myapp/static/js/my_vue.js
//Note: Consider adding delimiters: ['[[',']]'] to the configs.

//Directive for element that will be the toggler
Vue.directive('toggler', {
  bind(el, b, vnode) {
    el.addEventListener('click', (event) => vnode.context.$emit(b.value, event));
  }
});

Vue.directive('togglee', {
  bind(el, b, vnode, oldVnode) {
    vnode.context.$on(b.value, function() {
      let attribute = el.getAttribute('content-transition-class');
      if(attribute) attribute.split(' ').forEach((c) => el.classList.toggle(c));
      else el.classList.toggle('content-transition');
    });
  }
});

//Vue object that fetches our post/comment model from the database
var fetch_post = new Vue({
  delimiters: ['[[',']]'],
  el: '#fetch_post',
  data () {
    return {
      posts_list: [],
      sort_type: 'newest',
    }
  },

  mounted: function() {
    //Grab posts list and then periodically update every 10 seconds
    this.getPostsList();
    this.timer = setInterval(this.getPostsList, 10000);
  },

  methods: {
    //Sorts the post_list object by id, post, author, and num of comments
    sortedList: function() {
      switch(this.sort_type) {
        case 'newest':
          return this.posts_list.slice().sort(function(a,b){return b.id-a.id});
          break;
        case 'oldest':
          return this.posts_list.slice().sort(function(a,b){return a.id-b.id});
          break;
        case 'a_to_z':
          return this.posts_list.slice().sort(function(a,b){return a.post.localeCompare(b.post)});
          break;
        case 'z_to_a':
          return this.posts_list.slice().sort(function(a,b){return b.post.localeCompare(a.post)});
          break;
        case 'author_a':
          return this.posts_list.slice().sort(function(a,b){return a.author.localeCompare(b.author)});
          break;
        case 'author_z':
          return this.posts_list.slice().sort(function(a,b){return b.author.localeCompare(a.author)});
          break;
        case 'most':
          return this.posts_list.slice().sort(function(a,b){return b.comments.length-a.comments.length});
          break;
        case 'least':
          return this.posts_list.slice().sort(function(a,b){return a.comments.length-b.comments.length});
          break
        default:
          return this.posts_list.slice().sort(function(a,b){return a.id-b.id});
      }
    },

    getPostsList: function() {
      axios
        //Access our own API to get a json object
        .get('/rest_posts/')
        //Make sure to grab the response data, not the response itself
        .then(response => (this.posts_list = response.data.posts))
    },

    cancelAutoUpdate: function() {
      clearInterval(this.timer)
    }
  },

  beforeDestroy() {
    clearInterval(this.timer)
  }
})
