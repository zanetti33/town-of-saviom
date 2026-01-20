<template>
    <div 
        @click.stop="$emit('playerClicked', player.userId)"
        class="w-full flex flex-col items-center gap-1 rounded-lg transition-all p-1 bg-card-background" 
        :class="cardClasses">
        <!-- If extraInfo we display image on the left and info on the right -->
        <div v-if="extraInfo()" class="grid grid-cols-2 gap-6 justify-center items-center pt-2">
            <component 
                :is="getAvatarComponent(player.imageUrl)"
                class="avatar-image w-20 h-20" 
                :aria-label="'Player Icon'"
            />

            <div class="grid grid-cols-1 gap-2 justify-center items-center">
                <span v-if="player.isHost" class="text-sm text-secondary">Host</span>
                <button v-else-if="thisPlayerHost" 
                    class="no-button px-1! py-1!" 
                    @click.stop="$emit('removePlayer', player.userId)">Remove
                </button>
                <span v-if="player.isReady" class="text-primary">Ready</span>
                <span v-if="player.role" 
                    class="text-sm"
                    :class="player.role === 'WEREWOLF' ? 'text-bad' : 'text-secondary'">{{ player.role }}</span>
            </div>
        </div>

        <div v-else class="pt-2">
            <component
                :is="getAvatarComponent(player.imageUrl)"
                class="avatar-image w-20 h-20" 
                :aria-label="'Player Icon'"
            />
        </div>
        
        <div class="flex flex-row">
            <component
                v-if="isMe(player.userId)"
                :is="getAvatarComponent('default.svg')"
                class="w-8 h-8 text-secondary font-bold" 
                :aria-label="'Me Icon'"
            />
            <span class="text-lg font-bold" :class="isMe(player.userId) ? 'text-secondary' : 'text-white'">
                {{ isMe(player.userId) ? 'You' : player.name}}
            </span>
        </div>
        
    </div>
</template>


<script>
import { defineAsyncComponent } from 'vue';
import { useAuthStore } from '../stores/authStore';

export default {
    name: 'PlayerCard',
    emits: ['removePlayer', 'playerClicked'],
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
        },
        thisPlayerHost: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        cardClasses() {
            if (this.player.status === 'WATCHING' || this.player.status === 'LEFT') {
                return 'grayscale opacity-50 cursor-not-allowed border border-bad';
            }
            
            return this.isHighlighted() ? 'border-highlight border-2' : 'border-primary border';
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
            return this.player.isHost || this.player.isReady || this.player.role || this.thisPlayerHost;
        },
        isHighlighted() {
            return this.player.isSelected || this.player.isReady;
        },
        isMe(player) {
            const authStore = useAuthStore();
            return String(player) === String(authStore.user.id);
        }
    }
};
</script>