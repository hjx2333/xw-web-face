import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/IndexPage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    meta: {
      title: '人脸识别',
    },
  },
]

const router = new VueRouter({
  routes,
})

export default router
