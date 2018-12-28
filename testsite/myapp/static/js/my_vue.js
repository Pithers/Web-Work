//myapp/static/js/my_vue.js

//Note: Consider adding delimiters: ['[[',']]'] to the configs.

var fetch_app = new Vue({
  delimiters: ['[[',']]'],
  el: '#fetch_suggestion',
  data () {
    return {
      suggestions_list: null
    }
  },

  mounted: function() {
    this.getSuggestionsList();
    this.timer = setInterval(this.getSuggestionsList, 10000)
  },

  methods: {
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
