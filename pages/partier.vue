<template>
    <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Partier</h1>
            <p class="mt-2 text-sm text-gray-700">Oversikt over alle partier tilknyttet kommunen.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <UButton label="Nytt parti" @click="openModalNewParty" />
            <UModal v-model="modalNewPartyisOpen">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Nytt parti</h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalNewPartyisOpen = false" />
                        </div>
                    </template>
                    <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
                    <UForm :validate="validate" :state="newParty" @submit="addParty">
                        <UFormGroup label="Navn" name="name" class="mb-3">
                            <UInput v-model="newParty.name" />
                        </UFormGroup>
                        <UFormGroup label="Forkortelse" name="short_name" class="mb-3">
                            <UInput v-model="newParty.short_name" />
                        </UFormGroup>
                        <UButton type="submit">Lagre</UButton>
                    </UForm>
                    <template #footer>
                    </template>
                </UCard>
            </UModal>
            <UModal v-model="modalEditPartyisOpen">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Endre parti</h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalEditPartyisOpen = false" />
                        </div>
                    </template>
                    <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
                    <UForm :validate="validate" :state="editedParty" @submit="editParty">
                        <UFormGroup label="Navn" name="name" class="mb-3">
                            <UInput v-model="editedParty.name" />
                        </UFormGroup>
                        <UFormGroup label="Forkortelse" name="short_name" class="mb-3">
                            <UInput v-model="editedParty.short_name" />
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
                                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Parti</th>
                                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Forkortelse</th>
                                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                    <span class="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="party in parties" :key="party.id">
                                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{{ party.name }}</td>
                                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-3">{{ party.short_name }}</td>
                                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                    <a href="#" class="text-indigo-600 hover:text-indigo-900" @click="openModalEditParty(party)">Endre<span class="sr-only">, {{ party.name }}</span></a> |
                                    <a href="#" class="text-indigo-600 hover:text-indigo-900" @click="deleteParty(party.id)">Slett<span class="sr-only">, {{ party.name }}</span></a>
                                </td>
                            </tr>
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

const modalNewPartyisOpen = ref(false)
const modalEditPartyisOpen = ref(false)

const validate = (state) => {
    const errors = []
    if (!state.name) errors.push({ path: 'name', message: 'Påkrevet' })
    if (!state.short_name) errors.push({ path: 'short_name', message: 'Påkrevet' })
    return errors
}

const newParty = ref({
    name: undefined,
    short_name: undefined
})

const editedParty = ref({
    id: undefined,
    name: undefined,
    short_name: undefined
})

function openModalNewParty() {
    newParty.value = {
        name: undefined,
        short_name: undefined
    }
    modalNewPartyisOpen.value = true
}

function openModalEditParty(party) {
    editedParty.value.id = party.id
    editedParty.value.name = party.name
    editedParty.value.short_name = party.short_name
    modalEditPartyisOpen.value = true
}

async function getParties() {
    const { data } = await supabase.from('Parties').select()
    parties.value = data
}

async function addParty() {
    const { data, error } = await supabase
        .from('Parties')
        .insert([
            {
                name: newParty.value.name,
                short_name: newParty.value.short_name
            }
        ])
        .select()

    if (error) {
        errorMessage.value = error.message
    }
    else {
        parties.value.push(data[0])
        modalNewPartyisOpen.value = false
    }
}

async function editParty() {
    const { data, error } = await supabase
        .from('Parties')
        .update({
            name: editedParty.value.name,
            short_name: editedParty.value.short_name
        })
        .eq('id', editedParty.value.id)
        .select()

    if (error) {
        errorMessage.value = error.message
    }
    else {
        parties.value = parties.value.map(party => {
            if (party.id === data[0].id) return data[0]
            return party
        })
        modalEditPartyisOpen.value = false
    }
}

async function deleteParty(id) {
    const { error } = await supabase
        .from('Parties')
        .delete()
        .eq('id', id)

    if (error) {
        errorMessage.value = error.message
    }
    else {
        parties.value = parties.value.filter(party => party.id !== id)
    }
}

onMounted(() => {
    getParties()
})
</script>