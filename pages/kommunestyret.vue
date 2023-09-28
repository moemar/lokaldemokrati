<template>
    <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Kommunestyret</h1>
            <p class="mt-2 text-sm text-gray-700">Oversikt over alle medlemmer i kommunestyret, med partitilhørighet.</p>
        </div>
    </div>
    <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <CouncilNew />
                <div class="flex flex-row-reverse mb-2">
                    <div class="ml-2">
                        <CouncilMemberNew v-if="selectedCouncil" :council="selectedCouncil" />
                    </div>
                    <div>
                        <CouncilEdit v-if="selectedCouncil" class="ml-2" :council="selectedCouncil" />
                    </div>
                    <div class="basis-1/4">
                        <USelectMenu v-model="selectedCouncil" :options="councils">
                            <template #label>
                                <span v-if="selectedCouncil">{{ format(new Date(selectedCouncil.from)) }} - {{ format(new Date(selectedCouncil.to)) }}</span>
                                <span v-else>Velg kommunestyre</span>
                            </template>
                            <template #option="{ option: council }">
                                <span>{{ format(new Date(council.from)) }} - {{ format(new Date(council.to)) }}</span>
                            </template>
                        </USelectMenu>
                    </div>
                </div>
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mb-[500px]">
                    <CouncilMemberList :council="selectedCouncil?.id" />
                </div>
            </div>
        </div>
    </div>
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
</script>