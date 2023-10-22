<template>
    <div v-if="councilMeeting" class="lg:flex lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
            <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Møte i Kommunestyret den {{ formatDate(councilMeeting.date) }}</h2>
            <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                <div class="mt-2 flex items-center text-sm text-gray-500">
                    <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    Dato: {{ formatDate(councilMeeting.date) }}
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500">
                    <ClockIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria - hidden="true" />
                    Tid: {{ formatTime(councilMeeting.time_from) }} - {{ formatTime(councilMeeting.time_to) }}
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500">
                    <CloudIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    Acos: {{ councilMeeting.acos_id }}
                </div>
            </div>
        </div>
    </div>

    <div class="mt-5">
        <div class="sm:hidden">
            <label for="tabs" class="sr-only">Select a tab</label>
            <select id="tabs" name="tabs" class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                <option v-for="tab in tabs" :key="tab.name" :selected="tab.current">{{ tab.name }}</option>
            </select>
        </div>
        <div class="hidden sm:block">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <a v-for="tab in tabs" @click="changeTab(tab.id)" :key="tab.id" :href="tab.href" :class="[tab.current ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium']" :aria-current="tab.current ? 'page' : undefined">{{ tab.name }}</a>
                </nav>
            </div>
        </div>
    </div>

    <div v-if="selectedTab === 1" class="mt-4 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <pre>{{ councilMeeting }}</pre>
            </div>
        </div>
    </div>

    <div v-if="selectedTab === 2" class="mt-4 flow-root">
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mb-[500px]">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-white">
                    <tr>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Politiker</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Parti</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    <tr v-for="(councilMember, councilMemberIdx) in filteredCouncilMembers" :key="councilMember.id" :class="[councilMemberIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                        <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.Politicians.name }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.Politicians.Parties.name }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.CouncilMemberRoles.name }}</td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                            <USelect :options="statuses" option-attribute="name" placeholder="Ikke registrert" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import {
    ClockIcon,
    CloudIcon,
    CalendarIcon,
} from '@heroicons/vue/20/solid'

const route = useRoute()
const supabase = useSupabaseClient()
const councilMeeting = ref(undefined)
const councilMembers = ref([])
const councilMeetingAttendants = ref([])

const tabs = ref([
    { id: 1, name: 'Saksliste', href: '#', current: true },
    { id: 2, name: 'Fremmøte', href: '#', current: false }
])

const statuses = [{
    name: 'Registrert',
    value: 1
}, {
    name: 'Ikke møtt',
    value: 2
}]

async function getCouncilMeeting() {
    let { data, error } = await supabase
        .from('CouncilMeetings')
        .select()
        .eq('id', route.params.id)

    if (error) councilMeeting.value = undefined
    else councilMeeting.value = data[0]
}

async function getCouncilMembers() {
    let { data, error } = await supabase
        .from('CouncilMembers')
        .select(`
                id,
                Politicians (id, name, Parties (id, name)),
                CouncilMemberRoles (id, name, rank)
            `)
        .eq('council', councilMeeting.value.council)

    if (error) councilMembers.value = []
    else councilMembers.value = data
}

async function getCouncilMeetingAttendance() {
    let { data, error } = await supabase
        .from('CouncilMeetingAttendance')
        .select(`
                id,
                CouncilMeetings (id),
                CouncilMembers (id)
            `)
        .eq('CouncilMeetings.id', councilMeeting.value.id)

    if (error) councilMeetingAttendants.value = []
    else councilMeetingAttendants.value = data
}

// A computed short hand property that returns filtered council members
// we only want to show council members that are CouncilMemberRoles id 1,2,3
// Order by CouncilMemberRoles id first then Politicians.Parties.name second
const filteredCouncilMembers = computed(() => {
    return councilMembers.value
        .filter(councilMember => [1, 2, 3].includes(councilMember.CouncilMemberRoles.id))
        .sort((a, b) => a.CouncilMemberRoles.id - b.CouncilMemberRoles.id || a.Politicians.Parties.name.localeCompare(b.Politicians.Parties.name))
})

// A computed short hand property that returns the selected tab id.
const selectedTab = computed(() => {
    return tabs.value.find(tab => tab.current).id
})

// Function that changes the tab
function changeTab(tabId) {
    tabs.value.forEach(tab => {
        tab.current = tab.id === tabId
    })
}

// Function that returns the date in the format DD.MM.YYYY
// The input date is a string in the format YYYY-MM-DD
function formatDate(date) {
    const [year, month, day] = date.split('-')
    return `${day}.${month}.${year}`
}

// Function that return the time in the format HH:MM
// The input time is a string in the format HH:MM:SS
function formatTime(time) {
    const [hour, minute, second] = time.split(':')
    return `${hour}:${minute}`
}

// Watcher that fetches council members when tab is at id 2
watch(() => selectedTab.value, async (tabId) => {
    if (tabId === 2) {
        getCouncilMembers()
        getCouncilMeetingAttendance()
    }
})

onMounted(() => {
    getCouncilMeeting()
})
</script>