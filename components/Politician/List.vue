<template>
    <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-white">
            <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Navn</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span class="sr-only">Endre</span>
                </th>
            </tr>
        </thead>
        <tbody class="bg-white">
            <template v-for="party in  parties " :key="party.id">
                <tr class="border-t border-gray-200">
                    <th scope="colgroup" class="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">{{ party.name }} ({{ party.short_name }})</th>
                    <th scope="colgroup" class="bg-gray-50 py-2 pl-3 pr-4 sm:pr-3 text-right">
                        <PoliticianNew :button-label="`Ny politiker (${party.short_name})`" button-variant="outline" :party="party.id" />
                    </th>
                </tr>
                <tr v-for="( politician, politicianIdx ) in  party.Politicians " :key="politician.id" :class="[politicianIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{{ politician.name }}</td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <PoliticianEdit button-label="Endre" button-color="sky" button-variant="outline" :politician="politician" :party="party" />
                        <ItemDelete :title="`Slett ${politician.name}?`" :text="`Ønsker du virkelig å slette <b>${politician.name}</b>?`" button-color="rose" button-variant="outline" button-label="Slett" :id="politician.id" entity="Politicians" class="ml-2" />
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>

<script setup>
const supabase = useSupabaseClient()
const parties = ref([])

async function getParties() {
    let { data } = await supabase
        .from('Parties')
        .select(`
            id, name, short_name,
            Politicians (
                id, name, party
            )`)
        .order('name')

    parties.value = data
}

supabase.channel('custom-all-channel')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Politicians' },
        () => { getParties() }
    )
    .subscribe()

supabase.channel('custom-all-channel')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Parties' },
        () => { getParties() }
    )
    .subscribe()

onMounted(() => {
    getParties()
})
</script>