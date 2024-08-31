<template>
  <v-card>
    <v-card-title><h4>Country Details</h4></v-card-title>
    <v-card-text class="card-text-container">
      <div><b>Subregion:</b> {{ selectedCountry?.subregion || "-" }}</div>
      <div>
        <b>UN Member:</b>
        {{ selectedCountry?.unMembership === true ? "Yes" : "No" }}
      </div>
      <div>
        <b>Official Name:</b> {{ selectedCountry?.officialName || "-" }}
      </div>
      <div>
        <div v-if="selectedCountry?.borders?.length">
          <b>Bordering Countries:</b>
          <v-chip
            v-for="(border, index) in selectedCountry.borders"
            :key="index"
            color="#ff5722"
            variant="flat"
            class="ma-1"
          >
            {{ border }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
    <div class="map">
      <b>Explore the Country:</b>
      <iframe
        v-if="countryDetailsDialogOpen"
        :src="mapSrc"
        width="100%"
        style="border: 0"
        height="400"
        loading="lazy"
        allowfullscreen=""
      ></iframe>
    </div>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        text="Close"
        color="red"
        @click="closeCountryDetailsDialog"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "CountryDetailsDialog",
  props: {
    countryDetailsDialogOpen: {
      required: true,
    },
    selectedCountry: {
      required: true,
    },
    mapSrc: {
      required: true,
    },
  },
  methods: {
    closeCountryDetailsDialog() {
      this.$emit("countryDetailsDialogOpen", false);
    },
  },
};
</script>

<style scoped>
.card-text-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.map {
  padding: 1.5rem;
}
</style>
