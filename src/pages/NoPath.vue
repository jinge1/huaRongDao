<template>
  <div class="empty">
    no-path
  </div>
</template>

<script>
export default {
}
</script>

<style>
.app-page-empty::after{
  content:'no path';
  color:red;
  background: orange;
}
</style>
