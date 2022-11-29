<template>
  <div class="face-wrap">
    <p class="tip">{{ title }}</p>
    <div id="face-capture" class="face-capture">
      <video id="video" width="150" height="150" preload="auto" loop playsinline autoplay>
      </video>
      <canvas id="refCanvas" width="150" height="150"></canvas>
    </div>
    <p class="tip">{{ scanTip }}</p>
  </div>
</template>

<script>
import { validateFace } from '@/api/index'
export default {
  name: 'IndexPage',
  data() {
    return {
      title: '请将头部对准摄像头', // 提示文字
      scanTip: '',
      trackingStarted: false,
      ctrack: null,
      status: false,

      is_mouse_ok: false,
      is_alive_mouse: false,
      last_dis_eye_norse: 0,
      last_dis_mouse: 0,
      last_dm: 0,
      last_dis_header: 0,
      is_alive_header: false,

      last_eye_x: 0,
      last_eye_y: 0,
      last_mouse_x: 0,
      last_mouse_y: 0,

      last_nose_left: 0,
      last_nose_top: 0,

      src: '',
      validateTime: '',
      receipt: ''
    }
  },
  mounted() {
    this.receipt = this.$route.query.receipt
    this.playVideo()
  },
  methods: {
    playVideo() {
      this.getUserMedia(
        {
          // 摄像头拍摄的区域
          video: {
            width: 150,
            height: 150,
            facingMode: 'user'
          } /* 前置优先 */
          // video: true
        },
        this.success,
        this.error
      )
    },

    // 访问用户媒体设备
    getUserMedia(constrains, success, error) {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
      window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL

      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error);
      } else if (navigator.getUserMedia) {
        navigator.getUserMedia(constrains, success, error);
      } else {
        this.scanTip = '你的浏览器不支持访问用户媒体设备'
      }
    },

    success(stream) {
      const video = document.getElementById('video')
      if ('srcObject' in video) {
        video.srcObject = stream
      } else {
        video.src = window.URL.createObjectURL(stream)
      }

      // 苹果手机的系统弹框会阻止js的线程的继续执行 手动0.1秒之后自动执行代码
      // setTimeout(() => {
      //   video.play()
      //   this.initClmtrackr()
      //   this.initTracker() // 人脸捕捉
      // }, 100)

      // eslint-disable-next-line no-undef
      this.ctrack = new clm.tracker();
      this.ctrack.init();

      // document.addEventListener('clmtrackrIteration', function (event) {
      //   console.log(event)
      // }, false);

      video.onloadedmetadata = () => {
        video.play()
      }

      // video.oncanplay = () => {
      //   this.initClmtrackr()
      // }

      this.initClmtrackr()
    },

    error() {
      this.scanTip = '访问用户媒体失败'
    },

    initTracker() {
      this.context = document.getElementById('refCanvas').getContext('2d') // 画布

      this.canvas = document.getElementById('refCanvas')

      // eslint-disable-next-line no-undef
      this.tracker = new tracking.ObjectTracker('face') // tracker实例

      this.tracker.setInitialScale(4)

      this.tracker.setStepSize(2) // 设置步长

      this.tracker.setEdgesDensity(0.1)

      try {
        // eslint-disable-next-line no-undef
        this.trackertask = tracking.track('#video', this.tracker) // 开始追踪
      } catch (e) {
        this.scanTip = '访问用户媒体失败，请重试'
      }

      // 开始捕捉方法 一直不停的检测人脸直到检测到人脸
      this.tracker.on('track', e => {
        // 画布描绘之前清空画布
        // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        // e.data.forEach(rect => {
        //   // 设置canvas 方框的颜色大小
        //   this.context.strokeStyle = '#42e365'
        //   this.context.lineWidth = 2
        //   this.context.strokeRect(100, 20, 60, 60)
        // })

        if (e.data.length === 0) {
          this.scanTip = '未检测到人脸'
        } else {
          if (!this.tipFlag) {
            this.scanTip = '检测成功，正在拍照，请保持不动2秒'
          }

          // 1.5秒后拍照，仅拍一次 给用户一个准备时间

          // falg 限制一直捕捉人脸，只要拍照之后就停止检测
          // if (!this.flag) {
          //   this.scanTip = '拍照中...'
          //   this.flag = true
          //   this.removePhotoID = setTimeout(() => {
          //     this.tackPhoto()
          //     document.getElementById('video').pause()
          //     this.tipFlag = true
          //   }, 1500)
          // }
        }
      })
    },

    initClmtrackr() {
      const video = document.getElementById('video')
      video.play();
      // start tracking
      this.ctrack.start(video);
      this.trackingStarted = true;
      // start loop to draw face
      this.drawLoop();
    },

    drawLoop() {
      // const video = document.getElementById('video')
      // var overlay = document.getElementById('refCanvas');
      // var overlayCC = overlay.getContext('2d');
      requestAnimationFrame(this.drawLoop);
      // overlayCC.clearRect(0, 0, video.offsetWidth, video.offsetHeight);
      //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
      const position = this.ctrack.getCurrentPosition()
      if (position) {
        this.status = true
        this.title = '请保持头部不动'
        // this.ctrack.draw(overlay);
        if (!this.is_mouse_ok) {
          if (!this.is_alive_mouse) {
            this.alive_mouse()
          } else {
            this.validateMouse(position)
          }
        }
        // console.log(position)
      } else {
        this.title = '请将头部对准摄像头'
      }
      // setTimeout(() => {
      //   this.drawLoop()
      // }, 200);
    },

    alive_mouse() {
      //检测张嘴动作
      this.is_mouse_ok = false;
      this.last_dis_mouse = 0;
      this.last_time = 0;
      this.is_alive_mouse = true;
      this.is_alive_header = false
      this.last_nose_left = 0
      this.last_nose_top = 0
      this.validateTime = +new Date()
    },

    validateMouse(positions) {
      let { last_time, last_dis_eye_norse, last_dis_mouse, last_nose_left, last_nose_top, last_dm, validateTime } = this

      // 10秒内检测
      if (last_time === 0 || last_time - validateTime < 10000) {
        //眼睛和鼻子距离
        var xdiff = positions[62][0] - positions[27][0];
        var ydiff = positions[62][1] - positions[27][1];
        var dis_eye_norse = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);

        //上次的眼鼻距离和这次的眼鼻距离差
        var dn = Math.abs(dis_eye_norse - last_dis_eye_norse);

        //上嘴唇 和下嘴唇距离
        var xdiff_mouse = positions[53][0] - positions[47][0];
        var ydiff_mouse = positions[53][1] - positions[47][1];

        var dis_mouse = Math.pow((xdiff_mouse * xdiff_mouse + ydiff_mouse * ydiff_mouse), 0.5);
        var dm = Math.abs(dis_mouse - last_dis_mouse);

        //鼻子的位置确保变化不大
        if (!Math.floor(dn) && last_nose_left && last_nose_top && Math.abs(positions[62][0] - last_nose_left) < 10 &&
          Math.abs(positions[62][1] - last_nose_top) < 10) {
          // console.log('上下嘴唇距离', dm - last_dm)
          this.scanTip = '请在10秒内，做出张合嘴巴的动作'

          if (Math.floor(dm) && last_dm && (dm - last_dm) > 3) {
            this.is_mouse_ok = true
            this.scanTip = '检测成功，准备拍照'
            setTimeout(() => {
              this.scanTip = '拍照中...'
              this.tackPhoto()
              document.getElementById('video').pause()
            }, 1500);
          }
          this.last_dis_mouse = dis_mouse;
          this.last_dm = dm
        } else {
          this.title = '请保持头部不动'
        }

        this.last_time = new Date().getTime();
        this.last_dis_eye_norse = dis_eye_norse;
        this.last_dis_mouse = dis_mouse;
        this.last_nose_left = positions[62][0];
        this.last_nose_top = positions[62][1];
      } else {
        this.validateFail()
      }
    },

    // 拍照
    tackPhoto() {
      const context = document.getElementById('refCanvas').getContext('2d')
      // 在画布上面绘制拍到的照片
      context.drawImage(
        document.getElementById('video'),
        0,
        0,
        150,
        150
      )

      // 保存为base64格式
      const src = this.saveAsPNG(document.getElementById('refCanvas'))
      /** 拿到base64格式图片之后就可以在this.compare方法中去调用后端接口比较了，也可以调用getBlobBydataURI方法转化成文件再去比较
       * 我们项目里有一个设置个人头像的地方，先保存一下用户的图片，然后去拿这个图片的地址和当前拍照图片给后端接口去比较。
       * */

      // this.compare(imgUrl)
      // 判断图片大小
      // this.imgSize()
      this.validateFace(src) // 人脸比对
      this.close()
    },

    imgSize() {
      if (this.imgUrl) {
        // 获取base64图片byte大小
        const equalIndex = this.imgUrl.indexOf('=') // 获取=号下标
        let size

        if (equalIndex > 0) {
          const str = this.imgUrl.substring(0, equalIndex) // 去除=号
          const strLength = str.length
          const fileLength = strLength - (strLength / 8) * 2 // 真实的图片byte大小
          size = Math.floor(fileLength / 1024) // 向下取整
          console.log('size', size + 'KB')
        } else {
          const strLength = this.imgUrl.length
          const fileLength = strLength - (strLength / 8) * 2
          size = Math.floor(fileLength / 1024) // 向下取整
          console.log('size', size + 'KB')
        }

        if (size > 1024) {
          // 图片超过1M 按比例压缩
          this.imgUrl = document
            .getElementById('refCanvas')
            .toDataURL('image/png', 1024 / size)
        }
      }
    },

    // Base64转文件
    getBlobBydataURI(dataURI, type) {
      var binary = window.atob(dataURI.split(',')[1])

      var array = []

      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }

      return new Blob([new Uint8Array(array)], {
        type: type
      })
    },

    saveAsPNG(c) {
      return c.toDataURL('image/png', 0.4)
    },

    close() {
      // this.flag = false
      // this.tipFlag = false
      // this.showContainer = false
      // this.context = null
      // this.scanTip = '人脸识别中...'

      // clearTimeout(this.removePhotoID)

      // if (this.streamIns) {
      //   this.streamIns.enabled = false
      //   this.streamIns.getTracks()[0].stop()
      //   this.streamIns.getVideoTracks()[0].stop()
      // }

      // this.streamIns = null
      // this.trackertask.stop()
      // this.tracker = null
    },

    async validateFace(src) {
      const res = await validateFace({
        faceCode: src,
        receipt: this.receipt
      })
      if (res.success && res.status === 200) {
        this.$router.push('/validateSuccess')
        return
      }

      this.validateFail()
    },

    validateFail() {
      this.$dialog({
        message: '人脸识别失败，请再次按提示进行操作'
      }).then(() => {
        this.resetData()
      });
    },

    resetData() {
      cancelAnimationFrame(this.drawLoop)
      this.alive_mouse()
    },
  }
}
</script>

<style lang="scss" scoped>
.face-wrap {
  height: 100vh;
  background: #fff;
  padding: 20px;
}

#refCanvas {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0;
  margin: 0 auto;
  transform: scaleX(-1);
  filter: fliph;
  border-radius: 50%;
}

#video {
  transform: scaleX(-1);
  filter: fliph;
  border-radius: 50%;
}

.tip {
  text-align: center;
  padding: 10px 0;
}

.face-capture {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
