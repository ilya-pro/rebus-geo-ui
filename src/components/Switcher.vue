<template>
    <div class="reb-Switcher">
        <div v-for="(item, key) in items"
             class="reb-Switcher__item"
             :class="[ item.id === value ? 'reb-Switcher__item-active': 'reb-Switcher__item-inactive']"
             v-on:click="itemClick(item)"
             :key="key"
        >
            <span>{{ item.name }}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Switcher",
        props: {
            items: Array,
            value: String
        },
        methods: {
            itemClick(item) {
                /* для работы с компонентом снаружи через v-model
                   он должен отправлять событие input и принимать свойство value
                 */
                this.$emit('input', item.id);
            }
        }
    }
</script>

<style scoped>
    .reb-Switcher {
        display: inline-flex;
        cursor: pointer;
    }
    .reb-Switcher__item {
        padding: 0 1ch;
        line-height: 1.5;
    }
    .reb-Switcher__item:first-child {
        border-radius: 5px 0 0 5px ;
    }
    .reb-Switcher__item:last-child {
        border-radius: 0 5px 5px 0;
    }
    .reb-Switcher__item-active {
        background-color: white; /*#EBF2F7;*/
        box-shadow: 1px 1px 4px 0 inset #888;
    }
    .reb-Switcher__item-inactive {
        background-color: white;
    }

</style>
