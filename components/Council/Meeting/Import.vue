<template>
    <UButton :label="buttonLabel" :color="buttonColor" @click="openModal" :class="class" />
    <UModal v-model="modalIsOpen" :ui="{ base: 'overflow-visible', width: 'sm:max-w-screen-md' }">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800', base: 'overflow-visible' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">{{ title }}</h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalIsOpen = false" />
                </div>
            </template>
            <div class="flex flex-row-reversed mb-6">
                <UInput v-model="year" placeholder="Årstall" :required="true" class="mr-2" />
                <UButton :loading="loading" icon="i-heroicons-arrow-down-tray" size="sm" color="blue" variant="outline" label="Hent møter" :trailing="false" @click="getCouncilMeetings" />
            </div>
            <UTable :loading="loading" :rows="rows" :columns="columns" />
            <UPagination v-if="rows && rows.length > 0" v-model="page" :page-count="pageCount" :total="meetings.length" class="mt-4" />
            <!-- <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-white">
                    <tr>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Uke</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dato</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fra</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Til</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                            <span class="sr-only">Fjern</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    <tr v-for="(meeting, meetingIdx) in meetings" :key="meeting.Id" :class="[meetingIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ meeting.Id }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ meeting.Week }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ meeting.Date }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ meeting.TimeFrom }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ meeting.TimeTo }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ meeting.Status }}</td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        </td>
                    </tr>
                </tbody>
            </table>-->
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
const errorMessage = ref(undefined)
const modalIsOpen = ref(false)
const meetings = ref([])
const year = ref('')
const loading = ref(false)
const page = ref(1)
const pageCount = 5

const columns = [{
    key: 'Id',
    label: 'ID'
}, {
    key: 'Week',
    label: 'Uke'
}, {
    key: 'Date',
    label: 'Dato'
}, {
    key: 'TimeFrom',
    label: 'Fra'
}, {
    key: 'TimeTo',
    label: 'Til'
}, {
    key: 'Status',
    label: 'Status'
}]

const rows = computed(() => {
    return meetings.value.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})

const props = defineProps({
    council: {
        type: Object
    },
    buttonLabel: {
        type: String,
        default: 'Import'
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    title: {
        type: String,
        default: 'Importer kommunestyremøter fra Acos'
    },
    class: {
        type: String
    }
})

function openModal() {
    errorMessage.value = undefined
    modalIsOpen.value = true
}

async function getCouncilMeetings() {
    loading.value = true

    if (year.value !== '') {
        const { data, error } = await useFetch(`https://prod-248.westeurope.logic.azure.com/workflows/01ae7b8e0c304b25bf22fd9595ecf772/triggers/manual/paths/invoke/council/meetings/${year.value}/OhzR5UFiTk?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=BblAp-ganMBqmWMVObRwrgbyJHV7cu1Gm1P1Gr6y258`)

        if (error.value) errorMessage.value = error.value.data
        else meetings.value = data.value
    }

    loading.value = false
}

// async function addItem() {
//     const { error } = await supabase
//         .from('CouncilMeetings')
//         .insert([
//             {
//                 date: item.value.date,
//                 council: item.value.council
//             }
//         ])
//         .select()

//     if (error) errorMessage.value = error.message
//     else modalIsOpen.value = false
// }
</script>