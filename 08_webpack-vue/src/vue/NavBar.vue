<template>
  <!-- 使用 scoped 后，父组件的样式将不会渗透到子组件中。不过，子组件的根节点会同时被父组件的作用域样式和子组件的作用域样式影响。 -->
  <div>
    <h2>Hello World，我是局部组件</h2>
  </div>
</template>

<script>
  export default {
    data() {
      return {

      }
    }
  }
</script>

<style>

</style>