<template>
    <USelectMenu v-model="selectedCouncil" :options="councils">
        <template #label>
            <span v-if="selectedCouncil">{{ format(new Date(selectedCouncil.from)) }} - {{ format(new Date(selectedCouncil.to)) }}</span>
            <span v-else>Velg kommunestyre</span>
        </template>
        <template #option="{ option: council }">
            <span>{{ format(new Date(council.from)) }} - {{ format(new Date(council.to)) }}</span>
        </template>
    </USelectMenu>
</template>

<script setup>
const supabase = useSupabaseClient()
const councils = ref([])
const selectedCouncil = ref(undefined)

const format = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
}

async function getCouncils() {
    let { data, error } = await supabase
        .from('Councils')
        .select()
        .order('from')

    if (error) councils.value = []
    else councils.value = data

    if (selectedCouncil.value) selectedCouncil.value = data.find((council) => council.id === selectedCouncil.value.id)
    else selectedCouncil.value = data[0]
}


supabase.channel('custom-all-channel')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Councils' },
        () => getCouncils()
    )
    .subscribe()

onMounted(() => {
    getCouncils()
})

defineExpose({
    selectedCouncil
})
</script>