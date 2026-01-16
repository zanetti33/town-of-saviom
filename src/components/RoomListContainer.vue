<template>
    <div class="bg-container">
        <div class="main-container max-w-2xl">
            <RoomList />
            <div class="text-center">
                <button @click="$router.push('/dashboard')" class="link-button">
                    Return to dashboard
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import RoomList from './RoomList.vue';
export default {
    name: 'RoomListContainer',
    components: {
        RoomList
    }
};
</script>