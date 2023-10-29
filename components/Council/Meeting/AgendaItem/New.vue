<template>
    <UButton :label="buttonLabel" :color="buttonColor" @click="openModal" :class="class" />
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
                <UFormGroup label="Saksnummer" name="document_id" class="mb-3">
                    <UInput v-model="item.document_id" />
                </UFormGroup>
                <UFormGroup label="Tittel" name="document_name" class="mb-3">
                    <UInput v-model="item.document_name" />
                </UFormGroup>
                <UFormGroup label="Acos" name="acos_id" class="mb-3">
                    <UInput v-model="item.acos_id" />
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
        default: 'Ny sak'
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    title: {
        type: String,
        default: 'Ny sak'
    },
    class: {
        type: String
    },
    councilMeetingId: {
        type: Number,
        required: true
    }
})

const item = ref({
    document_id: undefined,
    document_name: undefined,
    acos_id: undefined
})

const validate = (state) => {
    const errors = []
    if (!state.document_id) errors.push({ path: 'document_id', message: 'Saksnummer' })
    if (!state.document_name) errors.push({ path: 'document_name', message: 'Tittel må fylles ut' })
    if (!state.acos_id) errors.push({ path: 'acos_id', message: 'Acos må fylles ut' })
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
        document_id: undefined,
        document_name: undefined,
        acos_id: undefined
    }

    errorMessage.value = undefined
    modalIsOpen.value = true
}

async function addItem() {
    const { error } = await supabase
        .from('CouncilMeetingAgendaItems')
        .insert([
            {
                document_id: item.value.document_id,
                document_name: item.value.document_name,
                acos_id: item.value.acos_id,
                council_meeting: props.councilMeetingId
            }
        ])
        .select()

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = false
}
</script>