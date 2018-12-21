<template>
<div class="loading">
  <img src="../assets/loading.gif" />
</div>
</template>

<script>
export default {
  data(){
    return {
      isShow: true
    }
  },
  mounted(){
    setTimeout(()=>{
      this.isShow = false
      console.log('loading done')
    }, 3000)
  }
}
</script>

<style scoped>
.loading{
  position: fixed;
  width:1rem;
  height: 1rem;
  background: rgba(0,0,0,.5);
  z-index: 6;
}
</style>
