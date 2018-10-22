<template>
  <div class="detail">
    {{ message }}
  </div>
</template>

<script>
export default {
  name: 'detail',
  data() {
    return {
      message: 'this is router'
    }
  },
  mounted() {
    this.getMessage()
  },
  methods: {
    getMessage() {
      this.message = 'this is router'+this.$route.params.id;
    }
  },
  watch: {
    $route() { //通过监听路由防止直接改变url参数页面数据不改变的情况
      // Object.assign(this.$data, this.$options.data())
      this.getMessage()
    }
  }
}
</script>

