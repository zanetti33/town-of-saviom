<template>
    <div class="grid gap-3 grid-cols-2 md:grid-cols-3 w-full justify-center">
        <PlayerCard v-for="player in players" :key="player.userId" :player="player" :avatars="avatars" :avatarsCache="avatarsCache"/>
    </div>
</template>

<script>
import PlayerCard from './PlayerCard.vue';
const avatars = import.meta.glob('../assets/img/profile/*.svg', { query: '?component' });

export default {
    data() {
        return {
            avatars: avatars
        };
    },
    props: {
        players: {
            type: Array,
            required: true
        }
    },
    components: {
        PlayerCard
    },
    created() {
        this.avatarsCache = new Map();        
    }
}
</script>