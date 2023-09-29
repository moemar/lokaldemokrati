<template>
    <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-white">
            <tr>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Møtedato</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span class="sr-only">Fjern</span>
                </th>
            </tr>
        </thead>
        <tbody class="bg-white">
            <tr v-for="(councilMeeting, councilMeetingIdx) in councilMeetings" :key="councilMeeting.id" :class="[councilMeetingIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                <td class="whitespace-nowrap px-3 py-4 text-sm">{{ format(new Date(councilMeeting.date)) }}</td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                    <ItemDelete :title="`Fjern ${councilMeeting.date}?`" :text="`Ønsker du virkelig å fjerne <b>${councilMeeting.date}</b>?`" button-color="rose" button-variant="outline" button-label="Fjern" :id="councilMeeting.id" entity="CouncilMeetings" class="ml-2" />
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
const supabase = useSupabaseClient()
const councilMeetings = ref([])

const props = defineProps({
    council: {
        type: String
    }
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
                date
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