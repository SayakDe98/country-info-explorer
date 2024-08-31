<template>
  <v-overlay v-model="mapDataLoading"> </v-overlay>
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
  <div class="content">
    <v-skeleton-loader
      boilerplate
      type="table"
      v-if="loading"
    ></v-skeleton-loader>
    <v-card flat v-if="!loading">
      <v-dialog v-model="countryDetailsDialogOpen" max-width="1000px">
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
              @click="countryDetailsDialogOpen = false"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div class="info-search-and-csv-export-container">
        <div>
          <h2 style="color: #ff5722">Country Information Explorer</h2>
        </div>
        <div>
          <v-text-field
            v-model="search"
            label="Search by Country Name or Country Region"
            append-inner-icon="mdi-magnify"
            prepend-inner-icon="mdi-map-marker"
            variant="outlined"
            hide-details
            single-line
            :model-value="search"
            width="50vw"
          ></v-text-field>
        </div>
        <div>
          <v-btn
            @click="exportTableDataToCSV"
            style="
              background-color: green;
              color: whitesmoke;
              text-transform: none;
            "
          >
            Export To CSV
          </v-btn>
        </div>
      </div>
      <v-data-table
        style="margin-top: 3rem"
        height="600"
        :header-props="headerProps"
        :headers="headers"
        :items="filteredCountries"
        :search="search"
        :items-per-page="currentItemsPerPage"
        :show-current-page="currentPage"
        :items-per-page-options="[20, 50, 100]"
        @update:items-per-page="handleCurrentItemsPerPage($event)"
        @update:page="handleCurrentPage($event)"
        v-if="filteredCountries.length"
        fixed-header
        :v-model:current-items="currentCountries"
        @update:current-items="handleCurrentItems($event)"
      >
        <template v-slot:item="{ item: country, index }">
          <tr
            @click="openRowDetailsDialog(country.rowClickInfo)"
            :style="{ background: index % 2 ? 'ghostwhite' : 'whitesmoke' }"
          >
            <td>
              {{ country.name || "" }}
            </td>
            <td>
              {{ country.capital || "-" }}
            </td>
            <td>
              <div v-if="country.currencyNames.length">
                <v-chip
                  v-for="(currencyName, index) in country.currencyNames"
                  :key="index"
                  color="#ff5722"
                  variant="flat"
                  class="ma-1"
                >
                  {{ currencyName }}
                </v-chip>
              </div>
              <div v-else>-</div>
            </td>
            <td>{{ country.region || "-" }}</td>
            <td>{{ country.latitude }}</td>
            <td>{{ country.longitude }}</td>
            <td>
              <div v-if="country.languages.length">
                <v-chip
                  v-for="(language, index) in country.languages"
                  :key="index"
                  color="#ff5722"
                  variant="flat"
                  class="ma-1"
                >
                  {{ language }}
                </v-chip>
              </div>
              <div v-else>-</div>
            </td>
            <td>{{ country.population }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AdminDashboard",
  data() {
    return {
      mapDataLoading: false,
      currentPage: 1,
      currentItemsPerPage: 20,
      currentCountries: [],
      headerProps: {
        style: {
          backgroundColor: "#ff5722",
          color: "white",
          cursor: "pointer",
        },
      },
      search: "",
      loading: false,
      mapSrc: `${import.meta.env.VITE_GOOGLE_MAPS_BASE_URI}?q=${
        this.center?.lat || "38"
      },${this.center?.lng || "38"}&key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }`,
      center: null,
      selectedCountry: null,
      selectedMap: null,
      encodedUri: null,
      countryDetailsDialogOpen: false,
      countries: [],
      filteredCountries: [],
      headers: [
        {
          title: "Country Name",
          value: "name",
          sortable: true,
        },
        { title: "Capital", value: "capital", sortable: true },
        { title: "Currency Name(s)", value: "currencyNames", sortable: true },
        { title: "Region", value: "region", sortable: true },
        { title: "Latitude", value: "latitude", sortable: true },
        { title: "Longitude", value: "longitude", sortable: true },
        {
          title: "Language(s)",
          value: "languages",
          sortable: true,
          align: "center",
        },
        { title: "Population", value: "population", sortable: true },
      ],
    };
  },
  methods: {
    async fetchCountries() {
      try {
        this.loading = true;
        const response = await fetch(
          `${import.meta.env.VITE_REST_COUNTRIES_BASE_URI}/all`
        );
        const data = await response.json();
        this.countries = data;
        this.filteredCountries = this.countries.map((country) => ({
          name: country?.name?.common + " " + country?.flag,
          capital: country?.capital?.length
            ? country?.capital[0]
            : country?.capital,
          currencyNames: this.getCurrencyNames(country?.currencies),
          region: country?.region,
          latitude: this.getLatitudeLongitude(country?.latlng, "lat"),
          longitude: this.getLatitudeLongitude(country?.latlng, "lng"),
          languages: this.getLanguages(country?.languages),
          population: country?.population,
          rowClickInfo: {
            unMembership: country?.unMember,
            officialName: country?.name?.official,
            subregion: country?.subregion,
            borders: country?.borders,
            maps: {
              openStreetMap: country?.maps?.openStreetMaps,
              googleMap: country?.maps?.googleMaps,
            },
          },
        }));
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    emptyArray(arr) {
      if (!Array.isArray(arr) || !arr.length) {
        return true;
      }
      return false;
    },
    getCapital(capital) {
      if (typeof capital !== "object") return "";

      if (this.emptyArray(capital)) return "";
      return capital[0];
    },
    getCurrencyNames(currencies) {
      if (typeof currencies !== "object") return "";
      const currenciesEntries = Object.entries(currencies);

      if (this.emptyArray(currenciesEntries)) return "";
      return currenciesEntries?.map((currency) => currency[1]?.name);
    },
    getLatitudeLongitude(latLng, key) {
      if (typeof latLng !== "object") return "";
      if (this.emptyArray(latLng)) return "";
      switch (key) {
        case "lat":
          return latLng[0];
        case "lng":
          return latLng.length > 1 ? latLng[1] : "";
        default:
          return "";
      }
    },
    getLanguages(languages) {
      if (typeof languages !== "object") return "";
      const languagesEntries = Object.entries(languages);
      if (this.emptyArray(languagesEntries)) return "";
      return languagesEntries?.map((languageEntry) => languageEntry[1]);
    },
    async openRowDetailsDialog(country) {
      this.mapDataLoading = true;
      const borderCountryNames = await this.fetchBorderCountryName(
        country?.borders
      );
      country.borders = borderCountryNames;
      this.selectedCountry = country;
      await this.extractGeoCoordinatesFromOSMLink(
        this.selectedCountry.maps.openStreetMap
      );
      this.mapDataLoading = false;
      this.countryDetailsDialogOpen = true;
    },
    async extractGeoCoordinatesFromOSMLink(osmLink) {
      try {
        const relationId = osmLink?.split("/relation")[1];
        const response = await fetch(
          `${
            import.meta.env.VITE_OPEN_STREET_BASE_URI
          }/0.6/relation${relationId}/full.json`
        );
        const data = await response.json();
        const nodes = data.elements.filter(
          (element) => element.type === "node"
        );
        this.center = this.calculateCenter(nodes);
      } catch (error) {
        console.error(
          "An Error encountered when fetching current country coordinates: ",
          error
        );
      }
    },
    async fetchBorderCountryName(codes) {
      try {
        if (codes?.length) {
          const response = await fetch(
            `${
              import.meta.env.VITE_REST_COUNTRIES_BASE_URI
            }/alpha?codes=${codes?.join(",")}`
          );
          const data = await response.json();
          if (!data?.length) {
            return [];
          }
          return data?.map((countryDetails) => countryDetails?.name?.common);
        } else {
          return [];
        }
      } catch (error) {
        console.error(
          "An Error encountered when fetching border country name: ",
          error
        );
      }
    },

    exportTableDataToCSV() {
      const csvContent = this.convertToCSV(
        this.search || this.currentCountries?.length
          ? this.currentCountries?.map(
              (currentCountry) => currentCountry.columns
            )
          : this.filteredCountries.slice(
              (this.currentPage - 1) * this.currentItemsPerPage,
              (this.currentPage - 1) * this.currentItemsPerPage +
                this.currentItemsPerPage
            )
      );
      const blob = new Blob([csvContent], { type: "text/csv;charset-utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "country_info.csv");
      link.click();
    },
    convertToCSV(data) {
      const rows = data.map((obj) =>
        this.headers.map((header) => {
          if (Array.isArray(obj[header.value])) {
            return obj[header.value].join(" & ");
          }
          return obj[header.value];
        })
      );
      const headerRow = this.headers.map((header) => header.title).join(",");
      const csvRows = [headerRow, ...rows.map((row) => row.join(","))];
      return csvRows.join("\n");
    },
    calculateCenter(nodes) {
      let totalLatitude = 0;
      let totalLongitude = 0;
      nodes.forEach((node) => {
        totalLatitude += node?.lat;
        totalLongitude += node?.lon;
      });
      const totalNodes = nodes?.length;
      return {
        lat: totalLatitude / totalNodes,
        lng: totalLongitude / totalNodes,
      };
    },
    updateMapUrl() {
      this.mapSrc = `${import.meta.env.VITE_GOOGLE_MAPS_BASE_URI}?q=${
        this.center.lat
      },${this.center.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    },
    handleCurrentItems(country) {
      this.currentCountries = country;
    },
    handleCurrentItemsPerPage(itemsPerPage) {
      this.currentItemsPerPage = itemsPerPage;
    },
    handleCurrentPage(page) {
      this.currentPage = page;
    },
  },
  async mounted() {
    this.fetchCountries();
  },
  watch: {
    "center.lat"(_) {
      this.updateMapUrl();
    },
    "center.lng"(_) {
      this.updateMapUrl();
    },
    search(_) {},
  },
};
</script>

<style>
html {
  max-height: 100vh;
  overflow-y: auto;
}
.content {
  padding: 5rem;
}
.card-text-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.mdi-map-marker {
  color: red !important;
}
.map {
  padding: 1.5rem;
}
.v-card-title {
  color: #ff5722;
}
.info-search-and-csv-export-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
tr {
  cursor: pointer;
}
</style>
