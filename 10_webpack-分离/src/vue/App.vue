<template>
  <h2>Hello World</h2>
  <h2>{{ message }}</h2>
  <hello-world></hello-world>
  <NavBarVue />
</template>

<script>
import NavBarVue from './NavBar.vue';

export default {
  components: {
    NavBarVue
  },
  data() {
    return {
      message: "Hello World123"
    }
  },
  methods: {

  }
}
</script>

<style scoped>
h2 {
  color: red;
}
</style>
