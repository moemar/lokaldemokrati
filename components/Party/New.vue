<template>
    <UButton :label="buttonLabel" :color="buttonColor" @click="openModal" />
    <UModal v-model="modalIsOpen">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">{{ title }}</h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalIsOpen = false" />
                </div>
            </template>
            <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
            <UForm ref="form" :validate="validate" :state="item">
                <UFormGroup label="Navn" name="name" class="mb-3">
                    <UInput v-model="item.name" />
                </UFormGroup>
                <UFormGroup label="Forkortelse" name="short_name" class="mb-3">
                    <UInput v-model="item.short_name" />
                </UFormGroup>
            </UForm>
            <template #footer>
                <template class="flex justify-between">
                    <UButton icon="i-heroicons-x-circle" size="sm" color="rose" variant="outline" label="Avbryt" :trailing="false" @click="modalIsOpen = false" />
                    <UButton icon="i-heroicons-pencil-square" size="sm" color="primary" variant="solid" label="Lagre" :trailing="false" @click="submitForm" />
                </template>
            </template>
        </UCard>
    </UModal>
</template>

<script setup>
const supabase = useSupabaseClient()
const errorMessage = ref(undefined)
const form = ref(null)
const modalIsOpen = ref(false)

const props = defineProps({
    buttonLabel: {
        type: String,
        default: 'Nytt parti'
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    title: {
        type: String,
        default: 'Nytt parti'
    }
})

const item = ref({
    name: undefined,
    short_name: undefined
})

const validate = (state) => {
    const errors = []
    if (!state.name) errors.push({ path: 'name', message: 'Navn må fylles ut' })
    if (!state.short_name) errors.push({ path: 'short_name', message: 'Forkortelse må fylles ut' })
    return errors
}

const submitForm = async () => {
    form.value.validate().then((success) => {
        if (success) addItem()
    }).catch(() => {
        errorMessage.value = 'Kunne ikke lagre endringer, sjekk at alle feltene er fylt ut korrekt.'
    })
}

function openModal() {
    item.value = {
        name: undefined,
        short_name: undefined
    }
    errorMessage.value = undefined
    modalIsOpen.value = true
}

async function addItem() {
    const { data, error } = await supabase
        .from('Parties')
        .insert([
            {
                name: item.value.name,
                short_name: item.value.short_name
            }
        ])
        .select()

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = false
}
</script>