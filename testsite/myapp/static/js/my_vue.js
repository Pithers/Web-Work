//myapp/static/js/my_vue.js

//Note: Consider adding delimiters: ['[[',']]'] to the configs.

//Custom vue direction for use with Foundation
Vue.directive('foundation', {
  bind(el) {
    $(el).foundation()
  },
  //Unbind was having problems with mixing foundation and vue.js
  /*unbind(el) {
    $(el).foundation.destroy()
  }*/
})

//Vue object that fetches our suggestions/comment model from the database
var fetch_app = new Vue({
  delimiters: ['[[',']]'],
  el: '#fetch_suggestion',
  data () {
    return {
      suggestions_list: [],
      sort_type: 'newest',
    }
  },

  mounted: function() {
    //Grab suggestions list and then periodically update every 10 seconds
    this.getSuggestionsList();
    this.timer = setInterval(this.getSuggestionsList, 10000);
  },

  methods: {
    //Sorts the suggestion_list object by id, suggestion, author, and num of comments
    sortedList: function() {
      switch(this.sort_type) {
        case 'newest':
          return this.suggestions_list.slice().sort(function(a,b){return b.id-a.id});
          break;
        case 'oldest':
          return this.suggestions_list.slice().sort(function(a,b){return a.id-b.id});
          break;
        case 'a_to_z':
          return this.suggestions_list.slice().sort(function(a,b){return a.suggestion.localeCompare(b.suggestion)});
          break;
        case 'z_to_a':
          return this.suggestions_list.slice().sort(function(a,b){return b.suggestion.localeCompare(a.suggestion)});
          break;
        case 'author_a':
          return this.suggestions_list.slice().sort(function(a,b){return a.author.localeCompare(b.author)});
          break;
        case 'author_z':
          return this.suggestions_list.slice().sort(function(a,b){return b.author.localeCompare(a.author)});
          break;
        case 'most':
          return this.suggestions_list.slice().sort(function(a,b){return b.comments.length-a.comments.length});
          break;
        case 'least':
          return this.suggestions_list.slice().sort(function(a,b){return a.comments.length-b.comments.length});
          break
        default:
          return this.suggestions_list.slice().sort(function(a,b){return a.id-b.id});
      }
    },

    getSuggestionsList: function() {
      axios
      //Access our own API to get a json object
        .get('/suggestions/')
      //Make sure to grab the response data, not the response itself
        .then(response => (this.suggestions_list = response.data.suggestions))
    },

    cancelAutoUpdate: function() {
      clearInterval(this.timer)
    }
  },

  beforeDestroy() {
    clearInterval(this.timer)
  }
})
