import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import page from '@/components/view'
import detail from '@/components/detail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'page',
      component: page
    }, {
      path: '/:id',
      name: 'detail',
      component: detail
    }
  ]
})
