<script setup lang="ts">
const supabase = useSupabaseClient()
const { data: { session }, error } = await supabase.auth.getSession()

const signOut = async () => {
    const { error } = await supabase.auth.signOut()
}

const signIn = async () => {
    navigateTo('/login')
}

supabase.auth.onAuthStateChange((event, session) => {
    if (event == 'SIGNED_OUT') {
        navigateTo('/')
    }
})
</script>
<template>
    <div>
        <h1>Welcome to the homepage</h1>
        <button v-if="session" @click="signOut">Logg ut</button>
        <button v-else @click="signIn">Logg inn</button>
        <pre>{{ session }}</pre>
    </div>
</template>
  