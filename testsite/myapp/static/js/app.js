$(document).foundation()

//custom vue direction for foundation
Vue.directive('foundation', {
    bind(el) {
        $(el).foundation()
    },
    unbind(el) {
        $(el).foundation.destroy()
    }
})
