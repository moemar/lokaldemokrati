<template>
    <UButton :label="buttonLabel" :color="buttonColor" :variant="buttonVariant" @click="openModal" :class="class" />
    <UModal v-model="modalIsOpen">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">{{ title }}</h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalIsOpen = false" />
                </div>
            </template>
            <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
            <div v-html="text"></div>
            <template #footer>
                <template class="flex justify-between">
                    <UButton icon="i-heroicons-x-circle" size="sm" color="rose" variant="outline" label="Avbryt" :trailing="false" @click="modalIsOpen = false" />
                    <UButton icon="i-heroicons-trash" size="sm" color="rose" variant="solid" label="Slett" @click="doDelete()" />
                </template>
            </template>
        </UCard>
    </UModal>
</template>

<script setup>
const supabase = useSupabaseClient()
const errorMessage = ref(undefined)
const modalIsOpen = ref(false)

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    buttonLabel: {
        type: String,
        default: 'Slett'
    },
    buttonIcon: {
        type: String
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    buttonVariant: {
        type: String,
        default: 'solid'
    },
    title: {
        type: String,
        default: 'Slett'
    },
    text: {
        type: String,
        default: 'Ønsker du virkelig å slette denne entiteten?'
    },
    class: {
        type: String
    }
})

function openModal() {
    errorMessage.value = undefined
    modalIsOpen.value = true
}

async function doDelete() {
    const { error } = await supabase
        .from(props.entity)
        .delete()
        .eq('id', props.id)

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = false
}
</script>