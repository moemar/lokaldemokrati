<template>
    <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-white">
            <tr>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Politiker</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Parti</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rolle</th>
            </tr>
        </thead>
        <tbody class="bg-white">
            <tr v-for="(councilMember, councilMemberIdx) in councilMembers" :key="councilMember.id" :class="[councilMemberIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.Politicians.name }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.Politicians.Parties.name }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">{{ councilMember.CouncilMemberRoles.name }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
const supabase = useSupabaseClient()
const councilMembers = ref([])

const props = defineProps({
    council: {
        type: String
    }
})

async function getCouncilMembers() {
    if (props.council) {
        let { data } = await supabase
            .from('CouncilMembers')
            .select(`
                id,
                Politicians (id, name, Parties (id, name)),
                CouncilMemberRoles (id, name, rank)
            `)
            .eq('council', props.council)
            .order('role')
            .order('name', { foreignTable: 'Politicians' })

        councilMembers.value = data
    } else {
        councilMembers.value = []
    }
}

watch(() => props.council, (newCouncil, oldCouncil) => {
    if (newCouncil && newCouncil !== oldCouncil) getCouncilMembers()
})

supabase.channel('custom-all-channel')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'CouncilMembers' },
        () => getCouncilMembers()
    )
    .subscribe()
</script>