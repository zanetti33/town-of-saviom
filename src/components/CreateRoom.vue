<template>
    <div class="lobby-container">
        <div class="lobby-box">
            <h1>Create Room</h1>
            <form @submit.prevent="createRoom">
                <div class="form-group">
                    <label for="roomName">Room Name:</label>
                    <input
                        id="roomName"
                        v-model="roomName"
                        type="text"
                        required
                        placeholder="Enter the room name"
                    />
                </div>
                <div class="form-group">
                    <input
                        id="classic"
                        value="classic"
                        v-model="gameMode"
                        type="radio"
                    />
                    <label for="classic">Classic</label>
                    <input
                        id="advanced"
                        value="advanced"
                        v-model="gameMode"
                        type="radio"
                    />
                    <label for="advanced">Advanced</label>
                </div>
                <div class="form-group">
                    <label for="maxPlayers">Max Players:</label>
                    <input
                        id="maxPlayers"
                        v-model="maxPlayers"
                        type="number"
                        required
                        placeholder="Enter max number of players"
                        min="6"
                        max="12"
                    />
                </div>
                <button type="submit">Create</button>
            </form>
            <button @click="$router.push('/dashboard')">Return to dashboard</button>
            <p v-if="error">{{ error }}</p>
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