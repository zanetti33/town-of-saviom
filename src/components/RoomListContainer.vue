<template>
    <div class="bg-container">
        <div class="main-container">
            <RoomList />
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