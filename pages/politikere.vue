<template>
    <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Politikere</h1>
            <p class="mt-2 text-sm text-gray-700">Oversikt over alle politikere tilknyttet kommunen.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <UButton label="Ny politiker" @click="openModalNewPolitician" />
            <UModal v-model="modalNewPoliticianIsOpen">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Ny politiker</h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalNewPoliticianIsOpen = false" />
                        </div>
                    </template>
                    <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
                    <UForm :validate="validate" :state="newPolitician" @submit="addPolitician">
                        <UFormGroup label="Navn" name="name" class="mb-3">
                            <UInput v-model="newPolitician.name" />
                        </UFormGroup>
                        <UFormGroup label="Parti" name="party" class="mb-3">
                            <USelect v-model="newPolitician.party" :options="parties" option-attribute="name" value-attribute="id" />
                        </UFormGroup>
                        <UButton type="submit">Lagre</UButton>
                    </UForm>
                    <template #footer>
                    </template>
                </UCard>
            </UModal>
            <UModal v-model="modalEditPoliticianIsOpen">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Endre politiker</h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalEditPoliticianIsOpen = false" />
                        </div>
                    </template>
                    <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
                    <UForm :validate="validate" :state="editedPolitician" @submit="editPolitician">
                        <UFormGroup label="Navn" name="name" class="mb-3">
                            <UInput v-model="editedPolitician.name" />
                        </UFormGroup>
                        <UFormGroup label="Parti" name="party" class="mb-3">
                            <USelect v-model="editedPolitician.party" :options="parties" option-attribute="name" value-attribute="id" />
                        </UFormGroup>
                        <UButton type="submit">Lagre</UButton>
                    </UForm>
                    <template #footer>
                    </template>
                </UCard>
            </UModal>
        </div>
    </div>
    <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-white">
                            <tr>
                                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Navn</th>
                                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                    <span class="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            <template v-for="party in parties" :key="party.id">
                                <tr class="border-t border-gray-200">
                                    <th colspan="2" scope="colgroup" class="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">{{ party.name }} ({{ party.short_name }})</th>
                                </tr>
                                <tr v-for="(politician, politicianIdx) in party.Politicians" :key="politician.id" :class="[politicianIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{{ politician.name }}</td>
                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                        <a href="#" class="text-indigo-600 hover:text-indigo-900" @click="openModalEditPolitician(politician, party.id)">Endre<span class="sr-only">, {{ politician.name }}</span></a> |
                                        <a href="#" class="text-indigo-600 hover:text-indigo-900" @click="deletePolitician(politician.id)">Slett<span class="sr-only">, {{ politician.name }}</span></a>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const parties = ref([])
const errorMessage = ref(undefined)

const modalNewPoliticianIsOpen = ref(false)
const modalEditPoliticianIsOpen = ref(false)

const validate = (state) => {
    const errors = []
    if (!state.name) errors.push({ path: 'name', message: 'Påkrevet' })
    if (!state.party) errors.push({ path: 'party', message: 'Påkrevet' })
    return errors
}

const newPolitician = ref({
    name: undefined,
    party: undefined
})

const editedPolitician = ref({
    id: undefined,
    name: undefined,
    party: undefined
})

function openModalNewPolitician() {
    newPolitician.value = {
        name: undefined,
        party: undefined
    }
    modalNewPoliticianIsOpen.value = true
}

function openModalEditPolitician(politician, party) {
    editedPolitician.value.id = politician.id
    editedPolitician.value.name = politician.name
    editedPolitician.value.party = party
    modalEditPoliticianIsOpen.value = true
}

async function addPolitician() {
    const { data, error } = await supabase
        .from('Politicians')
        .insert([
            {
                name: newPolitician.value.name,
                party: newPolitician.value.party
            }
        ])
        .select()

    if (error) {
        errorMessage.value = error.message
    }
    else {
        getParties()
        modalNewPoliticianIsOpen.value = false
    }
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

    if (error) {
        errorMessage.value = error.message
    }
    else {
        getParties()
        modalEditPoliticianIsOpen.value = false
    }
}

async function deletePolitician(id) {
    const { error } = await supabase
        .from('Politicians')
        .delete()
        .eq('id', id)

    if (error) {
        errorMessage.value = error.message
    }
    else {
        getParties()
    }
}

async function getParties() {
    let { data, error } = await supabase
        .from('Parties')
        .select(`
            id, name, short_name,
            Politicians (
                id, name
            )`)
        .order('name')

    parties.value = data
}

onMounted(() => {
    getParties()
})
</script>