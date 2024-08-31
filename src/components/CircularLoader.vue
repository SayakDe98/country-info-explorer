<template>
  <v-progress-circular
    color="#ff5722"
    indeterminate
    :size="60"
    :width="6"
    :v-if="mapDataLoading"
    :style="{
      position: 'absolute',
      top: '50%',
      left: '50%',
      zIndex: '999',
      display: mapDataLoading ? 'block' : 'none',
    }"
  ></v-progress-circular>
</template>

<script>
export default {
  name: "CircularLoader",
  props: {
    mapDataLoading: {
      required: true,
    },
  },
};
</script>
