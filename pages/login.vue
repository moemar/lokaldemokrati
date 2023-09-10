<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')

const signInWithOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
        email: email.value,
        options: {
            emailRedirectTo: 'http://localhost:3000/confirm',
        }
    })
    if (error) console.log(error)
}

const signInWithPassword = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })
    if (error) console.log(error)
    if (data) console.log(data)
}
</script>
<template>
    <div>
        <input v-model="email" type="email" />
        <input v-model="password" type="password" />
        <button @click="signInWithPassword">
            Sign In
        </button>
    </div>
</template>
