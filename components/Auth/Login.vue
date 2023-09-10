<script setup lang="ts">
import { ref } from 'vue'
import type { FormError, FormSubmitEvent } from '@nuxt/ui/dist/runtime/types'
import { navigateTo } from 'nuxt/app'
const supabase = useSupabaseClient()

const state = ref({
    email: undefined,
    password: undefined,
    error: undefined,
    loading: false
})

const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.email) errors.push({ path: 'email', message: 'E-post er påkrevet' })
    if (!state.password) errors.push({ path: 'password', message: 'Passord er påkrevet' })
    return errors
}

async function submit(event: FormSubmitEvent<any>) {
    state.value.loading = true
    state.value.error = undefined

    const { data, error } = await supabase.auth.signInWithPassword({
        email: event.data.email,
        password: event.data.password
    }).finally(() => {
        state.value.loading = false
    })

    if (error) state.value.error = error.message
    if (data && data.session) navigateTo('/')

}
</script>

<template>
    <UForm :validate="validate" :state="state" @submit="submit">
        <UFormGroup label="E-post" name="email">
            <UInput v-model="state.email" />
        </UFormGroup>
        <UFormGroup label="Passord" name="password" class="mt-3">
            <UInput v-model="state.password" type="password" />
        </UFormGroup>
        <UAlert v-show="state.error" :description="state.error" class="mt-3" color="red" variant="subtle" />
        <UButton type="submit" class="mt-3" :loading="state.loading">Logg inn</UButton>
    </UForm>
</template>
