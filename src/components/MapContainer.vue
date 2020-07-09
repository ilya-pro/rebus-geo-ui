<template>
    <div class="reb-MapContainer">
        <!--<span style="position: absolute; background-color: red; color: white;">MapCont</span>-->
        <!--TODO resize from ref-->
        <Map ref="map"
             :filter="filter"
             :mode="mode"/>
        <CatFilter :items="items"
                   v-on:filter-change="filterChange"/>
        <Switcher v-model="mode"
                  :items="modeItems"
                  class="reb-MapContainer__modeSwitcher"
                  v-on:mode-change="mapModeChange"/>
        <!--TODO ZoomPanel-->
        <!--TODO Search-->
    </div>
</template>

<script>
    import Map from '@/components/Map.vue'
    import CatFilter from "./CatFilter";
    import axios from "axios";
    import Switcher from "./Switcher";

    export default {
        name: "MapContainer",
        data () {
            return {
                items: [
                    {id: 'infant_school', name: 'Дошкольные учреждения', enabled: true, icon: 'kindergarten'},
                    {id: 'school', name: 'Школы', enabled: true, icon: 'school'},
                    {id: 'bus_station', name: 'Транспорт', enabled: false, icon: 'bus'},
                    {id: 'hospital', name: 'Медучреждения', enabled: false, icon: 'medicine'},
                    {id: 'culture', name: 'Культурные объекты', enabled: true, icon: 'culture'},
                    {id: 'sports_ground', name: 'Спортивные объекты', enabled: true, icon: 'sport'},
                    {id: 'post_office', name: 'Почтовые отделения', enabled: true, icon: 'basket'},
                    {id: 'waste_points', name: 'Пункты РСО', enabled: false, icon: 'basket'}
                ],
                modeItems: [
                    {id: 'all', name: 'вместе'},
                    {id: 'heat', name: 'тепловая'},
                    {id: 'hexagon', name: 'соты'}
                ],
                mode: 'heat'/*,
                filter: [/!*'school'*!/ 'bus_station']*/
            }
        },
        beforeDestroy: function () {
            window.removeEventListener('resize', this. handleWindowResize)
        },
        mounted() {
            window.addEventListener('resize', this.handleWindowResize);
            this.getCategories();
        },
        methods: {
            getCategories() {
                let filterString = '';
                axios
                    .get('https://rebus-hackaton.herokuapp.com/geo_data/categories/' + filterString)
                    .then(response => {
                        console.log('2 that', response.data);
                        this.items = response.data.map(item => {
                            return {
                                id: item.id,
                                name: item.name,
                                enabled: true
                            }
                        });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            },
            filterChange(filterItems) {
                let newFilter = [];
                for (var i = 0, len = filterItems.length; i < len; i++ ) {
                    if (filterItems[i].enabled) {
                        newFilter.push(filterItems[i].id);
                    }
                }
                this.filter = newFilter;
                //debugger;pr-HistoryOrdersCard__head
            },
            mapModeChange(mapMode) {
                console.log(mapMode);
            },
            handleWindowResize(/*event*/) {
                /*this.windowWidth = event.currentTarget.innerWidth;
                this.windowHeight = event.currentTarget.innerHeight;
                console.log('res', this.windowWidth,'r', this.windowHeight);*/
                // call resize for child
                this.$refs.map.resize();
            }
        },
        computed: {
            filter () {
                let newFilter = [];
                for (var i = 0, len = this.items.length; i < len; i++ ) {
                    if (this.items[i].enabled) {
                        newFilter.push(this.items[i].id);
                    }
                }
                return newFilter;
            }
        },
        components: {
            Switcher,
            CatFilter,
            Map
        }
    }
</script>

<style>
.reb-MapContainer {
    height: 100%;
}
.reb-MapContainer__modeSwitcher {
    position: absolute;
    top: 20px;
    right: 20px;
}
</style>
