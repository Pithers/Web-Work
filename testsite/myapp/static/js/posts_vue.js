//Filename: posts_vue.js
//Author: Brandon Smith

//File Description:
//This file contains all the logic needed for the posting and commenting system.
//This system is located in posts.html
//Logic includes, submitting, sorting, and querying the database of posts and comments.

//Contents:
//## Vue toggle button
//## Vue fetch_post

//Vue toggle button
//This allows the toggler element to switch a class on the togglee
//Directive for element that will be the toggler
Vue.directive('toggler', {
  bind(el, b, vnode) {
    el.addEventListener('click', (event) => vnode.context.$emit(b.value, event));
  }
});
//Directive for element that will get toggled
Vue.directive('togglee', {
  bind(el, b, vnode, oldVnode) {
    vnode.context.$on(b.value, function() {
      let attribute = el.getAttribute('content-transition-class');
      if(attribute) attribute.split(' ').forEach((c) => el.classList.toggle(c));
      else el.classList.toggle('content-transition');
    });
  }
});

//Vue fetch_post
//Vue object that fetches our post/comment models from the database
var fetch_post = new Vue({
  delimiters: ['[[',']]'],
  el: '#fetch_post',
  data () {
    return {
      posts_list: [],
      sort_type: 'newest',
    }
  },

  //Runs when loaded
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

    //Uses axios to grab comment/post models from the database
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

  //Removes timer before
  beforeDestroy() {
    clearInterval(this.timer)
  }
})
