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
                <UFormGroup label="Fra" name="from" class="mb-3">
                    <VueDatePicker v-model="item.from" :format="format" :teleport="true" locale="no" cancelText="Avbryt" selectText="Velg dato" auto-apply />
                </UFormGroup>
                <UFormGroup label="Til" name="to" class="mb-3">
                    <VueDatePicker v-model="item.to" :format="format" :teleport="true" locale="no" cancelText="Avbryt" selectText="Velg dato" auto-apply />
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
    buttonLabel: {
        type: String,
        default: 'Nytt kommunestyre'
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    title: {
        type: String,
        default: 'Nytt kommunestyre'
    },
    class: {
        type: String
    }
})

const format = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
}

const validate = (state) => {
    const errors = []
    if (!state.from) errors.push({ path: 'from', message: 'Påkrevet' })
    if (!state.to) errors.push({ path: 'to', message: 'Påkrevet' })
    return errors
}

const submitForm = async () => {
    form.value.validate().then((success) => {
        if (success) addItem()
    }).catch(() => {
        errorMessage.value = 'Kunne ikke lagre endringer, sjekk at alle feltene er fylt ut korrekt.'
    })
}

const item = ref({
    from: new Date(),
    to: new Date(new Date().setFullYear(new Date().getFullYear() + 4))
})

function openModal() {
    item.value = {
        from: new Date(),
        to: new Date(new Date().setFullYear(new Date().getFullYear() + 4))
    }

    errorMessage.value = undefined
    modalIsOpen.value = true
}

async function addItem() {
    const { error } = await supabase
        .from('Councils')
        .insert([
            {
                from: item.value.from,
                to: item.value.to
            }
        ])
        .select()

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = false
}
</script>