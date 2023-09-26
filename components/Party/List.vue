<template>
    <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-white">
            <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Parti</th>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Forkortelse</th>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3 text-center">Politikere</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span class="sr-only">Endre</span>
                </th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="party in parties" :key="party.id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{{ party.name }}</td>
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-3">{{ party.short_name }}</td>
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-3 text-center">{{ party.Politicians.length }}</td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                    <PoliticianNew button-label="Ny politiker" button-variant="outline" :party="party.id" />
                    <PartyEdit button-label="Endre" button-color="sky" button-variant="outline" :party="party" class="ml-2" />
                    <ItemDelete :title="`Slett ${party.name}?`" :text="`Ønsker du virkelig å slette <b>${party.name}</b>?`" button-color="rose" button-variant="outline" button-label="Slett" :id="party.id" entity="Parties" class="ml-2" />
                </td>
            </tr>
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
        { event: '*', schema: 'public', table: 'Parties' },
        () => { getParties() }
    )
    .subscribe()

onMounted(() => {
    getParties()
})
</script>