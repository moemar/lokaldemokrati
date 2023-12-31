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
            <div class="flex justify-end border-b mb-2 pb-6">
                <UInput v-model="year" :loading="loading" placeholder="Årstall" :required="true" class="mr-2" />
                <UButton :disabled="!year" :loading="loading" icon="i-heroicons-cloud-arrow-down" size="sm" color="blue" variant="outline" label="Hent møter" :trailing="false" @click="getCouncilMeetings" />
            </div>
            <div v-if="rows && rows.length > 0">
                <UTable :loading="loading" :rows="rows" :columns="columns" v-model="selectedMeetings" @select="select">
                    <template #Id-data="{ row }">
                        <div :class="row.imported ? 'text-green-600' : ''">
                            {{ row.Id }}
                        </div>
                    </template>
                    <template #Week-data="{ row }">
                        <div :class="row.imported ? 'text-green-600' : ''">
                            {{ row.Week }}
                        </div>
                    </template>
                    <template #Date-data="{ row }">
                        <div :class="row.imported ? 'text-green-600' : ''">
                            {{ row.Date }}
                        </div>
                    </template>
                    <template #TimeTo-data="{ row }">
                        <div :class="row.imported ? 'text-green-600' : ''">
                            {{ row.TimeTo }}
                        </div>
                    </template>
                    <template #TimeFrom-data="{ row }">
                        <div :class="row.imported ? 'text-green-600' : ''">
                            {{ row.TimeFrom }}
                        </div>
                    </template>
                    <template #Status-data="{ row }">
                        <div :class="row.imported ? 'text-green-600' : ''">
                            {{ row.Status }}
                        </div>
                    </template>
                    <template #imported-data="{ row }">
                        <div v-if="row.imported" class="text-green-600 text-center">
                            <UIcon name="i-heroicons-check" />
                        </div>
                        <div v-else class="text-red-600 text-center">
                            <UIcon name="i-heroicons-minus" />
                        </div>
                    </template>
                </UTable>
                <div class="flex justify-center">
                    <UPagination v-model="page" :page-count="pageCount" :total="meetings.length" class="mt-4" />
                </div>
                <UAlert v-show="errorMessage" :description="errorMessage" class="mt-5" color="red" variant="subtle" />
            </div>
            <template #footer>
                <template class="flex justify-between">
                    <UButton icon="i-heroicons-x-circle" size="sm" color="rose" variant="outline" label="Avbryt" :trailing="false" @click="modalIsOpen = false" />
                    <UButton :disabled="!(selectedMeetings && selectedMeetings.length > 0)" icon="i-heroicons-arrow-down-tray" size="sm" color="primary" variant="solid" :label="`Importer (${selectedMeetings.length})`" :trailing="false" @click="addItems" />
                </template>
            </template>
        </UCard>
    </UModal>
</template>

<script setup>
const supabase = useSupabaseClient()
const errorMessage = ref(undefined)
const modalIsOpen = ref(false)
const meetings = ref([])
const selectedMeetings = ref([])
const registeredMeetings = ref([])
const year = ref('')
const loading = ref(false)
const page = ref(1)
const pageCount = 5

const columns = [{
    key: 'Id',
    label: 'Id',
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
}, {
    key: 'imported',
    label: 'Importert',
    class: 'text-center'
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

supabase.channel('custom-filter-channel')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'CouncilMeetings', filter: `council=eq.${props.council?.id}` },
        () => { getRegisteredCouncilMeetings() }
    )
    .subscribe()

function select(row) {
    if (row.imported) return

    const index = selectedMeetings.value.findIndex((item) => item.Id === row.Id)
    if (index === -1) {
        selectedMeetings.value.push(row)
    } else {
        selectedMeetings.value.splice(index, 1)
    }
}

function openModal() {
    errorMessage.value = undefined
    modalIsOpen.value = true
    meetings.value = []
    selectedMeetings.value = []
    year.value = new Date().getFullYear()
}

async function getCouncilMeetings() {
    loading.value = true

    if (year.value !== '') {
        const { data, error } = await useFetch(`https://prod-248.westeurope.logic.azure.com/workflows/01ae7b8e0c304b25bf22fd9595ecf772/triggers/manual/paths/invoke/council/meetings/${year.value}/OhzR5UFiTk?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=BblAp-ganMBqmWMVObRwrgbyJHV7cu1Gm1P1Gr6y258`)

        if (error.value) errorMessage.value = error.value.data
        if (data.value) setMeetings(data)
    }

    loading.value = false
}

function setMeetings(data) {
    meetings.value = data.value.map((item) => {
        return {
            ...item,
            imported: registeredMeetings.value.findIndex((meeting) => meeting.acos_id === item.Id) !== -1,
            class: 'text-red-600'
        }
    })
}

async function getRegisteredCouncilMeetings() {
    if (props.council) {
        let { data } = await supabase
            .from('CouncilMeetings')
            .select(`
                id,
                acos_id
            `)
            .eq('council', props.council.id)

        registeredMeetings.value = data
    } else {
        registeredMeetings.value = []
    }
    setMeetings(meetings)
}

async function addItems() {
    loading.value = true
    errorMessage.value = undefined

    const convertFormat = date => {
        const parts = date.split('.');
        return `${parts[1]}.${parts[0]}.${parts[2]}`;
    }

    const { error } = await supabase
        .from('CouncilMeetings')
        .insert(selectedMeetings.value.map((item) => {
            return {
                council: props.council.id,
                acos_id: item.Id,
                date: convertFormat(item.Date),
                time_from: item.TimeFrom.replace('.', ':'),
                time_to: item.TimeTo.replace('.', ':')
            }
        }))
        .select()

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = true

    selectedMeetings.value = []
    loading.value = false
}

watch(() => modalIsOpen.value, (newVal, oldVal) => {
    if (newVal) getRegisteredCouncilMeetings()
})
</script>