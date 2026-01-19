<template>
    <div v-if="readyToStart" class="border-2 border-highlight p-2 rounded-full">
        <span class="text-highlight">Ready to start!</span>
    </div>
    <div v-else-if="playersNumber < roomCapacity" class="border-2 border-primary p-2 rounded-full">
        <span class="text-primary">Waiting for players... ({{ playersNumber }}/{{ roomCapacity }})</span>
    </div>
    <div v-else class="border-2 border-bad p-2 rounded-full">
        <span class="text-bad">Room is full! ({{ playersNumber }}/{{ roomCapacity }})</span>
    </div>
</template>

<script>
export default {
    props: {
        readyToStart: {
            type: Boolean,
            required: true
        },
        playersNumber: {
            type: Number,
            required: true
        },
        roomCapacity: {
            type: Number,
            required: true
        }
    }
}
</script>