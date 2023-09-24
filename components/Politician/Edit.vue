<template>
    <UButton :label="buttonLabel" :color="buttonColor" :variant="buttonVariant" @click="openModal" />
    <UModal v-model="modalIsOpen">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">{{ title }}</h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalIsOpen = false" />
                </div>
            </template>
            <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
            <UForm ref="form" :validate="validate" :state="editedPolitician">
                <UFormGroup label="Navn" name="name" class="mb-3">
                    <UInput v-model="editedPolitician.name" />
                </UFormGroup>
                <UFormGroup label="Parti" name="party" class="mb-3">
                    <USelect v-model="editedPolitician.party" :options="parties" option-attribute="name" value-attribute="id" />
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
const parties = ref([])
const form = ref(null)
const modalIsOpen = ref(false)

const props = defineProps({
    politician: {
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
        default: 'Endre politiker'
    }
})

const editedPolitician = ref({
    id: undefined,
    name: undefined,
    party: undefined
})

const validate = (state) => {
    const errors = []
    if (!state.name) errors.push({ path: 'name', message: 'Navn må fylles ut' })
    if (!state.party) errors.push({ path: 'party', message: 'Vennligst velg parti' })
    return errors
}

const submitForm = async () => {
    form.value.validate().then((success) => {
        if (success) editPolitician()
    }).catch(() => {
        errorMessage.value = 'Kunne ikke lagre endringer, sjekk at alle feltene er fylt ut korrekt.'
    })
}

function openModal() {
    getParties().then(() => {
        editedPolitician.value = {
            id: props.politician.id,
            name: props.politician.name,
            party: props.politician.party
        }
        errorMessage.value = undefined
        modalIsOpen.value = true
    })
}

async function editPolitician() {
    const { data, error } = await supabase
        .from('Politicians')
        .update({
            name: editedPolitician.value.name,
            party: editedPolitician.value.party
        })
        .eq('id', editedPolitician.value.id)
        .select()

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = false
}

async function getParties() {
    let { data } = await supabase
        .from('Parties')
        .select('id, name')
        .order('name')

    parties.value = data
}
</script>