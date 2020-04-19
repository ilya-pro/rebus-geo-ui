<template>
  <div class="home">
    <MapContainer/>
  </div>
</template>

<script>
  // @ is an alias to /src
  import MapContainer from '@/components/MapContainer.vue'

  export default {
    name: 'home',
    components: {
      MapContainer
    }
  }
</script>

<style>
  .home {
    height: 100%;
  }
</style>
