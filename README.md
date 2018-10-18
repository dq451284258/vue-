# **前言**
借用 [vue-admin-template](https://github.com/PanJiaChen/vue-admin-template) 简单的介绍一个完整的vue项目结构，你可以使用webpack配置一个vue项目或者用vue-cli直接生成一个项目。
# 技术栈
vue2 + vuex + vue-router + webpack + ES6
# 安装项目依赖
在package.json中：

```
"dependencies": {
    "axios": "0.18.0",                          //ajax异步请求
    "element-ui": "2.4.6",                      //elementUI组件
    "js-cookie": "2.2.0",                       //cookie组件
    "normalize.css": "7.0.0",                   //通用的css组件
    "nprogress": "0.2.0",                       //路由进度条组件
    "vue": "2.5.17",                            //vue
    "vue-router": "3.0.1",                      //vue的路由组件
    "vuex": "3.0.1"                             //vue项目状态管理组件
}
```
可以直接使用指令安装所有依赖：

```
npm install
```


# 目录结构

```
.
├── build                                       // webpack配置文件
├── config                                      // 项目打包路径
├── src                                         // 源码目录
│   ├── api                                     // api接口
│   ├── components                              // 组件
│   ├── assets                                  // 静态文件
│   ├── router                                  // 路由
│   ├── store                                   // 状态管理
│   ├── utils                                   // 静态js方法
│   ├── views                                   // 模块页面入口
│   ├── app.vue                                 // 页面入口文件
│   ├── main.js                                 // 程序入口文件，加载各种公共组件
│   ├── permission.js                           // 控制逻辑
├── index.html                                  // 入口html文件
.
```
# 目录解析
- ### index.html

    此文件是项目的html入口，所有的组件会被引入id为app的div中

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>vue-admin-template</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>
```
- ### main.js

    vue项目的程序入口，主要引入全局的组件，包括router，vuex

```
import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import router from './router'
import store from './store'

import '@/permission' // permission control

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
```
- ### permission.js

    很多时候我们浏览一些页面是需要权限的，例如一般的个人中心页面需要我们有登录态，如果没有的话需跳转到登录页，这时候就涉及到页面的重定向问题。
    vue-router提供了beforeEach方法，我们可以获得to参数以得到即将跳转的路由。

```
import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权

const whiteList = ['/login'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          next()
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})

```
- ### views
    
    views目录为主要的模块页面，建议每个模块新建目录：


```
.
├── src                                        
│   ├── views       
│        ├── login
│           ├── index.vue
│        ├── form
│        ├── layout
            ├── layout.vue
.
```

- ### router

    当有了页面以后，我们需要路由系统来访问这些页面,新建index.js


```
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index') },

  {
    path: '/',
    component: Layout,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  },
]

export default new Router({
  routes: constantRouterMap
})
```


当router完成以后可以访问页面。

# 个人小结

1. 开发环境解决跨域问题

    在config目录的index.js中,使用代理解决跨域问题，生产环境不存在该问题
    
```
module.exports = {
  dev: {
    proxyTable: {
      '/api': {
        target: 'https://zyt-dev.arctron.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    }
  }
}
```
2. 使用axios统一处理接口返回，组件里通过方法请求并返回回掉


```
import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data
    if (res.code !== 20000) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })

      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          '你已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
```
3. 路由模块设置主入口，再分配子路由

```
{
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: 'Example', icon: 'example' },
    children: [
      {
        path: 'table',
        name: 'Table',
        component: () => import('@/views/table/index'),
        meta: { title: 'Table', icon: 'table' }
      },
      {
        path: 'tree',
        name: 'Tree',
        component: () => import('@/views/tree/index'),
        meta: { title: 'Tree', icon: 'tree' }
      }
    ]
}
```
4. 使用vuex管理状态

    Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。也就是说 Vuex 用于单页面应用组件之间的数据共享，在组件嵌套很多层的情况下，Vue 中父子组件的通信过程就变得很麻烦，此时使用 Vuex 方便了组件间的通信。顺便说一下 HTML5 提供的数据存取机制 localStorage ，localStorage 存储的数据存在浏览器中，也就是本地磁盘中，localStorage 多数情况用于页面之间传递数据。Vuex 是将数据存储在了内存中，每一次刷新页面，之前存在 Vuex 中的数据就会重新初始化。
    
    由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。
    为了解决以上问题，Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割
    
    在store/modules中新建app.js
    
    
```
const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop'
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    }
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    }
  }
}

export default app
```


Vuex 允许我们在 store 中定义“getter”（可以认为是 store 的计算属性）。就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。
Getter 接受 state 作为其第一个参数：

```
const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device
}
export default getters
```
这样一个完整的store：

```
const store = new Vuex.Store({
  modules: {
    app
  },
  getters
})

export default store
```
获取状态：

```
this.$store.state.app.sidebar
```
改变状态：

```
this.$store.dispatch('CloseSideBar', { withoutAnimation: false })
```
