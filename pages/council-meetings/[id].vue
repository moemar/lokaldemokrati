<template>
    <div v-if="councilMeeting" class="lg:flex lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
            <!-- <nav class="flex" aria-label="Breadcrumb">
                <ol role="list" class="flex items-center space-x-4">
                    <li>
                        <div class="flex">
                            <NuxtLink to="/" class="text-sm font-medium text-gray-500 hover:text-gray-700" aria-current="page">Dashboard</NuxtLink>
                        </div>
                    </li>
                    <li>
                        <div class="flex items-center">
                            <ChevronRightIcon class="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            <NuxtLink to="/council-meetings" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">Møter</NuxtLink>
                        </div>
                    </li>
                </ol>
            </nav> -->
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
        <!-- <div class="mt-5 flex lg:ml-4 lg:mt-0">
            <span class="hidden sm:block">
                <button type="button" class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    <PencilIcon class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Edit
                </button>
            </span>

            <span class="ml-3 hidden sm:block">
                <button type="button" class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    <LinkIcon class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    View
                </button>
            </span>

            <span class="sm:ml-3">
                <button type="button" class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    <CheckIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Publish
                </button>
            </span>

            <Menu as="div" class="relative ml-3 sm:hidden">
                <MenuButton class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400">
                    More
                    <ChevronDownIcon class="-mr-1 ml-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                </MenuButton>

                <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <MenuItems class="absolute right-0 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <MenuItem v-slot="{ active }">
                        <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Edit</a>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                        <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">View</a>
                        </MenuItem>
                    </MenuItems>
                </transition>
            </Menu>
        </div> -->
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

    <div v-if="selectedTab === 1" class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <pre>{{ councilMeeting }}</pre>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ClockIcon,
    CloudIcon,
    CalendarIcon,
    // CheckIcon,
    // ChevronDownIcon,
    // LinkIcon,
    // PencilIcon,
} from '@heroicons/vue/20/solid'
// import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const route = useRoute()
const supabase = useSupabaseClient()
const councilMeeting = ref(undefined)

const tabs = ref([
    { id: 1, name: 'Saksliste', href: '#', current: true },
    { id: 2, name: 'Fremmøte', href: '#', current: false }
])

async function getCouncilMeeting() {
    let { data, error } = await supabase
        .from('CouncilMeetings')
        .select()
        .eq('id', route.params.id)

    if (error) councilMeeting.value = undefined
    else councilMeeting.value = data[0]
}

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

onMounted(() => {
    getCouncilMeeting()
})
</script>