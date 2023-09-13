<template>
    <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Partier</h1>
            <p class="mt-2 text-sm text-gray-700">Oversikt over alle partier tilknyttet kommunen.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <UButton label="Nytt parti" @click="isOpen = true" />
            <UModal v-model="isOpen">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">Nytt parti</h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                        </div>
                    </template>
                    <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
                    <UForm :validate="validate" :state="party" @submit="addParty">
                        <UFormGroup label="Navn" name="name" class="mb-3">
                            <UInput v-model="party.name" />
                        </UFormGroup>
                        <UFormGroup label="Forkortelse" name="shortName" class="mb-3">
                            <UInput v-model="party.shortName" />
                        </UFormGroup>
                        <UButton type="submit">Lagre</UButton>
                    </UForm>
                    <template #footer>
                    </template>
                </UCard>
            </UModal>
        </div>
    </div>
    <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-white">
                            <tr>
                                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Parti</th>
                                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">Forkortelse</th>
                                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                    <span class="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="party in parties" :key="party.id">
                                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{{ party.name }}</td>
                                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-3">{{ party.short_name }}</td>
                                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                    <a href="#" class="text-indigo-600 hover:text-indigo-900">Endre<span class="sr-only">, {{ party.id }}</span></a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const parties = ref([])
const errorMessage = ref(undefined)
const isOpen = ref(false)
const party = ref({
    name: undefined,
    shortName: undefined,
})

async function getParties() {
    const { data } = await supabase.from('Parties').select()
    parties.value = data
}

async function addParty() {
    const { data, error } = await supabase
        .from('Parties')
        .insert([
            { name: party.value.name, short_name: party.value.shortName },
        ])
        .select()

    if (error) {
        errorMessage.value = error.message
    }
    else {
        parties.value.push(data[0])
        isOpen.value = false
    }
}

onMounted(() => {
    getParties()
})
</script>