<template>
    <UButton :label="buttonLabel" :color="buttonColor" :variant="buttonVariant" @click="openModal" :class="class" />
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
                    <UButton icon="i-heroicons-pencil-square" size="sm" color="primary" variant="solid" label="Lagre" @click="submitForm" />
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
    party: {
        type: Object
    },
    buttonLabel: {
        type: String,
        default: 'Endre'
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    buttonVariant: {
        type: String,
        default: 'solid'
    },
    title: {
        type: String,
        default: 'Endre parti'
    },
    class: {
        type: String
    }
})

const item = ref({
    id: undefined,
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
        if (success) editItem()
    }).catch(() => {
        errorMessage.value = 'Kunne ikke lagre endringer, sjekk at alle feltene er fylt ut korrekt.'
    })
}

function openModal() {
    item.value = {
        id: props.party.id,
        name: props.party.name,
        short_name: props.party.short_name
    }
    errorMessage.value = undefined
    modalIsOpen.value = true
}

async function editItem() {
    const { error } = await supabase
        .from('Parties')
        .update({
            name: item.value.name,
            short_name: item.value.short_name
        })
        .eq('id', item.value.id)
        .select()

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = false
}
</script>