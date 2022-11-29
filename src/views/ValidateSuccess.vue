<!-- 人脸识别成功 -->
<template>
  <div class="validate-success-wrap">
    <div><img src="@/assets/success.png"></div>
    <div class="text">验证通过</div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    };
  },
  methods: {}
}

</script>
<style lang='scss' scoped>
.validate-success-wrap {
    text-align: center;
    padding: 80px 20px;

    img {
        width: 80px;
    }
    .text {
        font-size: 16px;
        letter-spacing: 1px;
        color: #666;
    }
}
</style>