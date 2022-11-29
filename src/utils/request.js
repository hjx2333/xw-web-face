import axios from 'axios'
import store from '@/store'
import { Toast } from 'vant'

const service = axios.create({
  // withCredentials: true,
  baseURL: location.origin,
  timeout: 20000
})

// 1.2 配置请求拦截器
service.interceptors.request.use(
  config => {
    // 列表页首次加载出现遮罩
    // if(config.method == 'get' || !config.params || config.params.pageNo == 1){
    //   Toast.loading({
    //     forbidClick: true,
    //     message: '加载中...',
    //     duration: 0
    //   });
    // }
    if (config.method === 'get') {
      config.params = {
        // 为get请求加上时间戳，避免缓存
        _t: Date.parse(new Date()) / 1000,
        ...config.params
      }
    }

    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// 1.3 配置响应拦截器
service.interceptors.response.use(
  response => {
    // 对返回的数据进行处理
    Toast.clear()
    /**
     * 后端正常返回，且逻辑信息完全正确，得到预设的结果
     * 第一种情况：返回正常接口
     * 第二种情况：返回二进制文件
     */
    if (
      response.status === 200 &&
      (response.data.code === 200 && response.data.success)
    ) {
      return response.data
    } else {
      // 后台正确响应，但是提示逻辑错误的处理
      // console.log('后台逻辑错误', response.data)
      response.data.message && Toast(response.data.message)
      return Promise.reject(response.data)
    }
  },
  error => {
    Toast.clear()
    if (error && error.stack.indexOf('timeout') > -1) {
      if (store.getters.comTips) {
        Toast.fail('接口请求超时，请稍后再试或联系网络管理员！')
      }
    }
    return Promise.reject(error)
  }
)

export default service
