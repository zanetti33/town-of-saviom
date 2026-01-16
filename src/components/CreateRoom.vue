<template>
    <div class="bg-container">
        <div class="main-container max-w-2xl">
            <h2 class="section-title">Create Room</h2>
            <form @submit.prevent="createRoom">
                <div class="form-group">
                    <label for="roomName" class="sr-only">Room Name:(max 30 characters)</label>
                    <input
                        id="roomName"
                        v-model="roomName"
                        type="text"
                        required
                        maxlength="30"
                        placeholder="Enter the room name... e.g. Dark Forest"
                        class="form-field"
                    />
                </div>
                <div class="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-12 my-6">
                    <div class="flex items-center justify-center gap-4">
                        <label class="text-slate-500 whitespace-nowrap">Game Mode:</label>
                        <div class="p-1 rounded-lg inline-flex border border-slate-700">
                            <label for="classic" class="cursor-pointer">
                                <input id="classic" value="classic" v-model="gameMode" type="radio" class="peer sr-only" checked/>
                                <span class="item-selector">Classic</span>
                            </label>
                            <label for="advanced" class="cursor-pointer">
                                <input id="advanced" value="advanced" v-model="gameMode" type="radio" class="peer sr-only"/>
                                <span class="item-selector">Advanced</span>
                            </label>
                        </div>
                    </div>

                    <div class="flex items-center justify-center gap-4">
                        <label class="text-slate-500 whitespace-nowrap">Max Players:</label>
                        <div class="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-gray-900">
                            <button type="button" @click="decrementPlayers" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors">-</button>
                            <div class="w-12 text-center font-bold text-purple-400">
                                {{ maxPlayers }}
                            </div>
                            <button type="button" @click="incrementPlayers" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors">+</button>
                        </div>
                    </div>

                </div>
                <button type="submit" class="submit-button w-full py-4 mt-4">Create</button>
            </form>
            <div class="error-message" v-if="error">
                <p>{{ error }}</p>
            </div>
            <div class="text-center">
                <button @click="$router.push('/dashboard')" class="link-button">Return to dashboard</button>
            </div>
        </div>
    </div>
</template>

<script>
import { lobbyApi } from '../services/api';
import router from '../router';

export default {
    data() {
        return {
            roomName: '',
            gameMode: 'classic',
            maxPlayers: 6,
            error: ''
        };
    },
    methods: {
        incrementPlayers() {
            if (this.maxPlayers < 12) {
                this.maxPlayers++;
            }
        },
        decrementPlayers() {
            if (this.maxPlayers > 6) {
                this.maxPlayers--;
            }
        },
        createRoom() {
            if (this.roomName && this.gameMode && this.maxPlayers) {
                console.log('Create room attempt:', { name: this.roomName, mode: this.gameMode, maxPlayers: this.maxPlayers });
                postRoom(this.roomName, this.gameMode, this.maxPlayers);
                this.error = '';
            } else {
                this.error = 'Please fill in all fields';
            }
        }
    }
};

const postRoom = async (name, gameMode, roomCapacity) => {
    try {
        // Call Lobby API to create room
        const res = await lobbyApi.post('/rooms', { name, gameMode, roomCapacity });

        console.log("Create room successful:", res.data);
        console.log("Push on lobby");
        router.push(`/rooms/${res.data._id}`);
    } catch (err) {
        console.error("Create room failed:", err);
        alert("Create room failed");
    }
};
</script>

<style scoped>
</style>