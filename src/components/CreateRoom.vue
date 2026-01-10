<template>
    <div class="bg-container">
        <div class="main-container">
            <h2 class="section-title">Create Room</h2>
            <form @submit.prevent="createRoom">
                <div class="form-group">
                    <label for="roomName" class="sr-only">Room Name:</label>
                    <input
                        id="roomName"
                        v-model="roomName"
                        type="text"
                        required
                        placeholder="Enter the room name"
                        class="form-field"
                    />
                </div>
                <div class="flex items-center justify-center gap-4 m-4">
                    <div class="p-1 rounded-lg inline-flex border border-slate-700 m-4">
                        <label for="classic" class="cursor-pointer">
                            <input
                            id="classic"
                            value="classic"
                            v-model="gameMode"
                            type="radio"
                            class="peer sr-only"
                            checked/>
                            <span class="item-selector">
                                Classic
                            </span>
                        </label>
                        <label for="advanced" class="cursor-pointer">
                            <input
                            id="advanced"
                            value="advanced"
                            v-model="gameMode"
                            type="radio"
                            class="peer sr-only"/>
                            <span class="item-selector">
                                Advanced
                            </span>
                        </label>
                    </div>
                    <div class="flex items-center justify-center gap-4 m-4 max-w-fit">
                        <label for="maxPlayers" class="w-fit max-w-fit">Max Players:</label>
                        <input
                            id="maxPlayers"
                            v-model="maxPlayers"
                            type="number"
                            required
                            placeholder="Enter max number of players"
                            class="form-field"
                            min="6"
                            max="12"
                        />
                    </div>
                </div>
        
                <button type="submit" class="submit-button">Create</button>
            </form>
            <div class="error-message" v-if="error">
                <p>{{ error }}</p>
            </div>
            <div class="mt-8 text-center">
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