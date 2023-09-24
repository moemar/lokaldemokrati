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
            <UForm ref="form" :validate="validate" :state="politician">
                <UFormGroup label="Navn" name="name" class="mb-3">
                    <UInput v-model="politician.name" />
                </UFormGroup>
                <UFormGroup label="Parti" name="party" class="mb-3">
                    <USelect v-model="politician.party" :options="parties" option-attribute="name" value-attribute="id" />
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
const parties = ref([])
const form = ref(null)
const modalIsOpen = ref(false)

const props = defineProps({
    buttonLabel: {
        type: String,
        default: 'Ny politiker'
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    title: {
        type: String,
        default: 'Ny politiker'
    }
})

const politician = ref({
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
        if (success) addPolitician()
    }).catch(() => {
        errorMessage.value = 'Kunne ikke lagre endringer, sjekk at alle feltene er fylt ut korrekt.'
    })
}

function openModal() {
    politician.value = {
        name: undefined,
        party: undefined
    }
    errorMessage.value = undefined
    modalIsOpen.value = true
}

async function addPolitician() {
    const { data, error } = await supabase
        .from('Politicians')
        .insert([
            {
                name: politician.value.name,
                party: politician.value.party
            }
        ])
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

onMounted(() => {
    getParties()
})
</script>