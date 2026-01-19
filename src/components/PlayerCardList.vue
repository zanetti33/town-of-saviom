<template>
    <div class="grid gap-3 grid-cols-2 md:grid-cols-3 w-full justify-center">
        <PlayerCard 
            v-for="player in players" 
            :key="player.userId" 
            :player="player" 
            :avatars="avatars" 
            :avatarsCache="avatarsCache" 
            :thisPlayerHost="thisPlayerHost"
            @remove-player="$emit('remove-player', $event)" 
        />
    </div>
</template>

<script>
import PlayerCard from './PlayerCard.vue';
const avatars = import.meta.glob('../assets/img/profile/*.svg', { query: '?component' });

export default {
    emits: ['remove-player'],
    data() {
        return {
            avatars: avatars
        };
    },
    props: {
        players: {
            type: Array,
            required: true
        },
        thisPlayerHost: {
            type: Boolean,
            required: false,
            default: false
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