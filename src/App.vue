<script setup>
import LoginPage from "@/pages/LoginPage.vue"
import NotFoundPage from "@/pages/NotFound.vue"
import { ref } from "vue"

const page = ref("Login")
</script>

<template>
    <LoginPage v-if="page === 'Login'" />
    <NotFoundPage v-else />
</template>
