<template>
    <div class="mb-3">
        <div class="sm:hidden">
            <label for="years" class="sr-only">Select a tab</label>
            <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
            <select id="years" name="years" class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                <option v-for="year in years" :key="year.name" :selected="year.current">{{ year.name }}</option>
            </select>
        </div>
        <div class="hidden sm:block">
            <div>
                <nav class="-mb-px flex space-x-8" aria-label="years">
                    <a v-for="year in years" :key="year.name" href="#" @click="changeYear(year.name)" :class="[year.current ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700', 'flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium']" :aria-current="year.current ? 'page' : undefined">
                        {{ year.name }}
                        <span v-if="year.count" :class="[year.current ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-900', 'ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block']">{{ year.count }}</span>
                    </a>
                </nav>
            </div>
        </div>
    </div>
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mb-[500px]">
        <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-white">
                <tr>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Møtedato</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fra</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Til</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Referanse Acos</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                        <span class="sr-only">Fjern</span>
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white">
                <tr v-for="(councilMeeting, councilMeetingIdx) in filteredCouncilMeetings" :key="councilMeeting.id" :class="[councilMeetingIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <NuxtLink :to="`/council-meetings/${councilMeeting.id}`">{{ format(new Date(councilMeeting.date)) }}</NuxtLink>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMeeting.time_from }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMeeting.time_to }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMeeting.acos_id }}</td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <ItemDelete :title="`Fjern ${councilMeeting.date}?`" :text="`Ønsker du virkelig å fjerne <b>${councilMeeting.date}</b>?`" button-color="rose" button-variant="outline" button-label="Fjern" :id="councilMeeting.id" entity="CouncilMeetings" class="ml-2" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const councilMeetings = ref([])
const currentYear = ref(new Date().getFullYear())

const props = defineProps({
    council: {
        type: String
    }
})

// Create a computed property that return the distinct years from the councilMeetings as an array of objects.
// The object array should contain the following properties:
// - name: The year
// - href: The URL to the year
// - count: The number of council meetings in the year
// - current: Whether the year is the current year, the current year should be selected by default
const years = computed(() => {
    const years = councilMeetings.value.map(councilMeeting => new Date(councilMeeting.date).getFullYear())
    const distinctYears = [...new Set(years)]
    return distinctYears.map(year => {
        return {
            name: year,
            href: '#',
            count: councilMeetings.value.filter(councilMeeting => new Date(councilMeeting.date).getFullYear() === year).length,
            current: year === currentYear.value
        }
    })
})

// A function that change the current year to the selected year
// It accepts the year as a parameter, make sure to convert it to a number
// The function should also update the current year in the years computed property
const changeYear = (year) => {
    currentYear.value = Number(year)
}

/* A function that return a filtered list of meetings based on the selected year */
const filteredCouncilMeetings = computed(() => {
    return councilMeetings.value.filter(councilMeeting => new Date(councilMeeting.date).getFullYear() === currentYear.value)
})

const format = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
}

async function getCouncilMeetings() {
    if (props.council) {
        let { data } = await supabase
            .from('CouncilMeetings')
            .select(`
                id,
                date,
                time_from,
                time_to,
                acos_id
            `)
            .eq('council', props.council)
            .order('date', { ascending: false })

        councilMeetings.value = data
    } else {
        councilMeetings.value = []
    }
}

watch(() => props.council, (newCouncil, oldCouncil) => {
    if (newCouncil && newCouncil !== oldCouncil) getCouncilMeetings()
})

supabase.channel('custom-all-channel')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'CouncilMeetings' },
        () => getCouncilMeetings()
    )
    .subscribe()
</script>