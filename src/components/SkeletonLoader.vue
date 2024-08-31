<template>
  <v-skeleton-loader
    boilerplate
    type="table"
    v-if="loading"
  ></v-skeleton-loader>
</template>

<script>
export default {
  name: "SkeletonLoader",
  props: {
    loading: {
      required: true,
    },
  },
};
</script>
