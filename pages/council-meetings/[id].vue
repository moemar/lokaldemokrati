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
                    <tr :class="[councilMember.SelectedStatus === 1 ? 'bg-green-50' : councilMember.SelectedStatus === 2 ? 'bg-red-50' : 'bg-slate-50', councilMemberIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']" v-for="(councilMember, councilMemberIdx) in regularCouncilMembers" :key="councilMember.id">
                        <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.Politicians.name }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.Politicians.Parties.name }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.CouncilMemberRoles.name }}</td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                            <USelect v-model="councilMember.SelectedStatus" :options="councilMember.Statuses" option-attribute="name" @change="changeStatus($event, councilMember)" />
                            <USelect v-if="councilMember.SelectedStatus === 2" v-model="councilMember.ReplacementMember" class="mt-2" :options="substituteCouncilMembers(councilMember.Politicians.Parties.id)" value-attribute="id" option-attribute="Politicians.name" placeholder="Velg varamedlem" @change="updateReplacementMember($event, councilMember)" />
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
const councilMeetingAttendantStatus = ref([])

const tabs = ref([
    { id: 1, name: 'Saksliste', href: '#', current: true },
    { id: 2, name: 'Fremmøte', href: '#', current: false }
])

const statuses = [{
    name: 'Ikke registrert',
    value: 0
}, {
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
    else {
        // Add statuses to each council member
        data.forEach(councilMember => {
            councilMember.Statuses = statuses
        })

        councilMembers.value = data
    }
}

async function getCouncilMeetingAttendance() {
    let { data, error } = await supabase
        .from('CouncilMeetingAttendance')
        .select(`
                id,
                CouncilMeetings (id),
                CouncilMember:CouncilMembers!council_member (id),
                CouncilMemberReplacement:CouncilMembers!replacement_council_member (id),
                status
            `)
        .eq('CouncilMeetings.id', councilMeeting.value.id)

    // Filter away items where CouncilMeetings is null
    // Take into consideration that data can be undefined
    data = data?.filter(councilMeetingAttendance => councilMeetingAttendance.CouncilMeetings)

    if (error) councilMeetingAttendants.value = []
    else councilMeetingAttendants.value = data
}

// A computed short hand property that returns filtered council members
// we only want to show council members that are CouncilMemberRoles id 1,2,3
// Order by CouncilMemberRoles id first then Politicians.Parties.name second
// Add a SelectedStatus property to each council member
const regularCouncilMembers = computed(() => {
    return councilMembers.value
        .filter(councilMember => [1, 2, 3].includes(councilMember.CouncilMemberRoles.id))
        .sort((a, b) => a.CouncilMemberRoles.rank - b.CouncilMemberRoles.rank || a.Politicians.Parties.name.localeCompare(b.Politicians.Parties.name))
        .map(councilMember => {
            councilMember.SelectedStatus = councilMeetingAttendants.value.find(councilMeetingAttendant => councilMeetingAttendant.CouncilMember.id === councilMember.id)?.status || 0
            councilMember.ReplacementMember = councilMeetingAttendants.value.find(councilMeetingAttendant => councilMeetingAttendant.CouncilMember.id === councilMember.id)?.CouncilMemberReplacement?.id || null
            return councilMember
        })
})

// A computed short hand function that returns filtered council members
// we only want to show council members that are CouncilMemberRoles id 4
// Filter by Politicians.Parties.id === partyId
// Remove node Statuses
function substituteCouncilMembers(partyId) {
    return councilMembers.value
        .filter(councilMember => councilMember.CouncilMemberRoles.id === 4)
        .filter(councilMember => councilMember.Politicians.Parties.id === partyId)
        .map(councilMember => {
            delete councilMember.Statuses
            return councilMember
        })
}


// A computed short hand property that returns the selected tab id.
const selectedTab = computed(() => {
    return tabs.value.find(tab => tab.current).id
})

function changeStatus(e, councilMember) {
    // Convert e.target.value to number and store as a new variable
    const status = Number(e.target.value)

    // If the CouncilMeetingAttendance exists, update the status calling the function updateCouncilMeetingAttendance
    // Else create a new CouncilMeetingAttendance calling the function createCouncilMeetingAttendance
    const councilMeetingAttendance = councilMeetingAttendants.value.find(councilMeetingAttendant => councilMeetingAttendant.CouncilMember.id === councilMember.id)
    if (councilMeetingAttendance) updateCouncilMeetingAttendance(councilMeeting.value.id, councilMember.id, status)
    else createCouncilMeetingAttendance(councilMeeting.value.id, councilMember.id, status)
}

function updateReplacementMember(e, councilMember) {
    // Convert e.target.value to number and store as a new variable
    const replacementCouncilMemberId = Number(e.target.value)

    updateCouncilMeetingAttendanceReplacement(councilMeeting.value.id, councilMember.id, replacementCouncilMemberId)
}

async function updateCouncilMeetingAttendanceReplacement(councilMeetingId, councilMemberId, replacement_council_member) {
    await supabase
        .from('CouncilMeetingAttendance')
        .update({ replacement_council_member })
        .eq('council_meeting', councilMeetingId)
        .eq('council_member', councilMemberId)
}

// Async function that updates the council meeting attendance
async function updateCouncilMeetingAttendance(councilMeetingId, councilMemberId, status) {
    await supabase
        .from('CouncilMeetingAttendance')
        .update({ status, replacement_council_member: null })
        .eq('council_meeting', councilMeetingId)
        .eq('council_member', councilMemberId)
}

// Async function that creates a new council meeting attendance
async function createCouncilMeetingAttendance(councilMeetingId, councilMemberId, status) {
    await supabase
        .from('CouncilMeetingAttendance')
        .insert({ council_meeting: councilMeetingId, council_member: councilMemberId, status })
}

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


supabase.channel('custom-all-channel')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'CouncilMeetingAttendance' },
        (payload) => {
            // Replace the council meeting attendance with the updated one
            // payload.new is the updated council meeting attendance
            // payload.new.id is the id of the updated council meeting attendance
            // replace the council meeting attendance with the updated one
            const councilMeetingAttendance = councilMeetingAttendants.value.find(councilMeetingAttendant => councilMeetingAttendant.id === payload.new.id)
            councilMeetingAttendance.status = payload.new.status
        }
    )
    .subscribe()

onMounted(() => {
    getCouncilMeeting()
})
</script>