<template>
    <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Kommunestyret</h1>
            <p class="mt-2 text-sm text-gray-700">Oversikt over alle medlemmer i kommunestyret, med partitilhørighet.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <UButton label="Nytt kommunestyre" @click="openModalNewCouncil" />
            <UModal v-model="modalNewCouncilIsOpen">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Nytt kommunestyre</h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalNewCouncilIsOpen = false" />
                        </div>
                    </template>
                    <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
                    <UForm :validate="validate" :state="newCouncil" @submit="addCouncil">
                        <UFormGroup label="Fra" name="from" class="mb-3">
                            <VueDatePicker v-model="newCouncil.from" :format="format" :teleport="true" locale="no" cancelText="Avbryt" selectText="Velg dato" auto-apply />
                        </UFormGroup>
                        <UFormGroup label="Til" name="to" class="mb-3">
                            <VueDatePicker v-model="newCouncil.to" :format="format" :teleport="true" locale="no" cancelText="Avbryt" selectText="Velg dato" auto-apply />
                        </UFormGroup>
                        <UButton type="submit">Lagre</UButton>
                    </UForm>
                    <template #footer>
                    </template>
                </UCard>
            </UModal>
            <UModal v-model="modalViewCouncilIsOpen">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Detaljer</h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalViewCouncilIsOpen = false" />
                        </div>
                    </template>
                    <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
                    <UForm ref="formEditCouncil" :validate="validate" :state="editedCouncil" @submit="editCouncil">
                        <UFormGroup label="Fra" name="from" class="mb-3">
                            <VueDatePicker v-model="editedCouncil.from" :format="format" :teleport="true" locale="no" cancelText="Avbryt" selectText="Velg dato" auto-apply />
                        </UFormGroup>
                        <UFormGroup label="Til" name="to" class="mb-3">
                            <VueDatePicker v-model="editedCouncil.to" :format="format" :teleport="true" locale="no" cancelText="Avbryt" selectText="Velg dato" auto-apply />
                        </UFormGroup>
                    </UForm>
                    <template #footer>
                        <template class="flex justify-between">
                            <UButton icon="i-heroicons-trash" size="sm" color="red" variant="outline" label="Slett" :trailing="false" />
                            <UButton icon="i-heroicons-pencil-square" size="sm" color="primary" variant="solid" label="Lagre" :trailing="false" @click="submitFormEditCouncil" />
                        </template>
                    </template>
                </UCard>
            </UModal>
        </div>
    </div>
    <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div class="flex flex-row-reverse mb-2">
                    <div v-if="selectedCouncil" class="basis-1/7 ml-2">
                        <UButton label="Detaljer" @click="openModalViewCouncil" block />
                    </div>
                    <div class="basis-1/4">
                        <USelectMenu v-model="selectedCouncil" :options="councils" :searchable="search" creatable>
                            <template #label>
                                <span v-if="selectedCouncil">{{ format(new Date(selectedCouncil.from)) }} - {{ format(new Date(selectedCouncil.to)) }}</span>
                                <span v-else>Velg kommunestyre</span>
                            </template>
                            <template #option="{ option: council }">
                                <span>{{ format(new Date(council.from)) }} - {{ format(new Date(council.to)) }}</span>
                            </template>
                        </USelectMenu>
                    </div>
                </div>
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mb-[500px]">
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-white">
                            <tr>
                                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Navn</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">E-post</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rolle</th>
                                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                    <span class="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            <template v-for="location in locations" :key="location.name">
                                <tr class="border-t border-gray-200">
                                    <th colspan="5" scope="colgroup" class="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">{{ location.name }}</th>
                                </tr>
                                <tr v-for="(person, personIdx) in location.people" :key="person.email" :class="[personIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{{ person.name }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ person.title }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ person.email }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ person.role }}</td>
                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                        <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit<span class="sr-only">, {{ person.name }}</span></a>
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
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const supabase = useSupabaseClient()
const councils = ref([])
const selectedCouncil = ref(undefined)
const errorMessage = ref(undefined)

const format = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
}

const search = async (q) => {
    if (!q) return councils.value
    return councils.value.filter((council) => {
        return format(new Date(council.from)).includes(q) || format(new Date(council.to)).includes(q)
    })
}

const validate = (state) => {
    const errors = []
    if (!state.from) errors.push({ path: 'from', message: 'Påkrevet' })
    if (!state.to) errors.push({ path: 'to', message: 'Påkrevet' })
    return errors
}

const formEditCouncil = ref(null)

const submitFormEditCouncil = async () => {
    formEditCouncil.value.validate().then((success) => {
        if (success) editCouncil()
    }).catch(() => {
        errorMessage.value = 'Kunne ikke lagre endringer, sjekk at alle feltene er fylt ut korrekt.'
    })
}

const modalNewCouncilIsOpen = ref(false)
const modalViewCouncilIsOpen = ref(false)

const newCouncil = ref({
    from: new Date(),
    to: new Date(new Date().setFullYear(new Date().getFullYear() + 4))
})

const editedCouncil = ref({
    id: undefined,
    from: new Date(),
    to: new Date(new Date().setFullYear(new Date().getFullYear() + 4))
})

function openModalNewCouncil() {
    newCouncil.value = {
        from: new Date(),
        to: new Date(new Date().setFullYear(new Date().getFullYear() + 4))
    }
    modalNewCouncilIsOpen.value = true
}

function openModalViewCouncil() {
    editedCouncil.value = {
        id: selectedCouncil.value.id,
        from: selectedCouncil.value.from,
        to: selectedCouncil.value.to
    }
    modalViewCouncilIsOpen.value = true
}


async function addCouncil() {
    const { data, error } = await supabase
        .from('Councils')
        .insert([
            {
                from: newCouncil.value.from,
                to: newCouncil.value.to
            }
        ])
        .select()

    if (error) {
        errorMessage.value = error.message
    }
    else {
        getCouncils()
        modalNewCouncilIsOpen.value = false
    }
}

async function editCouncil() {
    const { data, error } = await supabase
        .from('Councils')
        .update({
            from: editedCouncil.value.from,
            to: editedCouncil.value.to
        })
        .eq('id', editedCouncil.value.id)
        .select()

    if (error) {
        errorMessage.value = error.message
    }
    else {
        getCouncils()
        modalViewCouncilIsOpen.value = false
    }
}

async function getCouncils() {
    let { data, error } = await supabase
        .from('Councils')
        .select()
        .order('from')

    councils.value = data
}

onMounted(() => {
    getCouncils()
})
</script>