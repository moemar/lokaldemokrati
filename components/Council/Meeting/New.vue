<template>
    <UButton :label="buttonLabel" :color="buttonColor" @click="openModal" :class="class" />
    <UModal v-model="modalIsOpen" :ui="{ base: 'overflow-visible' }">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800', base: 'overflow-visible' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">{{ title }}</h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalIsOpen = false" />
                </div>
            </template>
            <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
            <UForm ref="form" :validate="validate" :state="item">
                <UFormGroup label="Dato" name="date" class="mb-3">
                    <VueDatePicker v-model="item.date" :format="format" :teleport="true" locale="no" cancelText="Avbryt" selectText="Velg dato" auto-apply />
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
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const supabase = useSupabaseClient()
const errorMessage = ref(undefined)
const modalIsOpen = ref(false)
const form = ref(null)

const props = defineProps({
    council: {
        type: Object
    },
    buttonLabel: {
        type: String,
        default: 'Nytt medlem'
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    title: {
        type: String,
        default: 'Nytt kommunestyremedlem'
    },
    class: {
        type: String
    }
})

const item = ref({
    date: new Date()
})

function openModal() {
    item.value = {
        date: new Date(),
        council: props.council.id
    }

    errorMessage.value = undefined
    modalIsOpen.value = true
}

const validate = (state) => {
    const errors = []
    if (!state.date) errors.push({ path: 'date', message: 'Påkrevet' })
    return errors
}

const submitForm = async () => {
    form.value.validate().then((success) => {
        if (success) addItem()
    }).catch(() => {
        errorMessage.value = 'Kunne ikke lagre endringer, sjekk at alle feltene er fylt ut korrekt.'
    })
}

async function addItem() {
    const { error } = await supabase
        .from('CouncilMeetings')
        .insert([
            {
                date: item.value.date,
                council: item.value.council
            }
        ])
        .select()

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = false
}
</script>