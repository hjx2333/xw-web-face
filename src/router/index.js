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
  {
    path: '/validateSuccess',
    name: 'ValidateSuccess',
    component: () => import('@/views/ValidateSuccess.vue'),
    meta: {
      title: '验证通过'
    }
  }
]

const router = new VueRouter({
  routes,
})

export default router
