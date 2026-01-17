<template>
    <div class="w-full flex flex-col items-center gap-1 rounded-lg transition-all p-1" 
        :class="isHighlighted() ? 'border-primary border-2' : 'border-highlight border'">
        <!-- If extraInfo we display image on the left and info on the right -->
        <div v-if="extraInfo()" class="grid grid-cols-2 gap-8 justify-center items-center pt-2">
            <component 
                :is="getAvatarComponent(player.imageUrl)"
                class="avatar-image w-20 h-20" 
                :aria-label="'Player Icon'"
            />

            <div class="grid grid-cols-1 gap-2 justify-center items-center">
                <span v-if="player.isHost" class="text-sm text-secondary">Host</span>
                <span v-if="player.isReady" class="text-primary">Ready</span>
                <span v-if="player.role" class="text-sm text-bad">{{ player.role }}</span>
            </div>
        </div>

        <!-- Else we diplay only the image centered -->
        <div v-else class="pt-2">
            <component
                :is="getAvatarComponent(player.imageUrl)"
                class="avatar-image w-20 h-20" 
                :aria-label="'Player Icon'"
            />
        </div>
        
        <span class="text-lg font-bold">{{ player.name }}</span>
    </div>
</template>


<script>
import { defineAsyncComponent } from 'vue';

export default {
    name: 'PlayerCard',
    props: {
        player: {
            type: Object,
            required: true
        },
        avatars: {
            type: Object,
            required: true
        },
        avatarsCache: {
            type: Map,
            required: true
        }
    },
    methods: {
        getAvatarComponent(imgName) {
            if (!imgName) {
                return defineAsyncComponent(this.avatars['../assets/img/profile/default.svg']);
            } else {
                const path = `../assets/img/profile/${imgName}`;
            
            if (this.avatarsCache.has(path)) {
                return this.avatarsCache.get(path);
            }
            if (!this.avatars[path]) {
                console.warn(`Avatar not found: ${path}`);
                return null;
            }

            const comp = defineAsyncComponent(this.avatars[path]);
            this.avatarsCache.set(path, comp);
            return comp;
            }
        },
        extraInfo() {
            console.log(this.player);
            return this.player.isHost || this.player.isReady || this.player.isSelected;
        },
        isHighlighted() {
            return this.player.isSelected || this.player.isReady;
        }
    }
};
</script>