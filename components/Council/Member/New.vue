<template>
    <UButton :label="buttonLabel" :color="buttonColor" @click="openModal" :class="class" />
    <UModal v-model="modalIsOpen" :ui="{ base: 'overflow-visible' }">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800', base: 'overflow-visible' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">{{ title }}</h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="modalIsOpen = false" />
                </div>
            </template>
            <UAlert v-show="errorMessage" :description="errorMessage" class="mb-3" color="red" variant="subtle" />
            <UForm ref="form" :validate="validate" :state="item">
                <UFormGroup label="Politiker" name="politician" class="mb-3">
                    <USelectMenu v-model="item.politician" :options="politicians" :searchable="searchPoliticians" searchablePlaceholder="Søk etter politiker">
                        <template #label>
                            <span v-if="item.politician">{{ item.politician.name }} ({{ item.politician.Parties.name }})</span>
                            <span v-else>Velg politiker</span>
                        </template>
                        <template #option="{ option: politician }">
                            <span>{{ politician.name }} ({{ politician.Parties.name }})</span>
                        </template>
                    </USelectMenu>
                </UFormGroup>
                <UFormGroup label="Rolle" name="role" class="mb-3">
                    <USelect v-model="item.role" :options="roles" option-attribute="name" value-attribute="id" placeholder="Velg rolle" />
                </UFormGroup>
            </UForm>
            <template #footer>
                <template class="flex justify-between">
                    <UButton icon="i-heroicons-x-circle" size="sm" color="rose" variant="outline" label="Avbryt" :trailing="false" @click="modalIsOpen = false" />
                    <UButton icon="i-heroicons-pencil-square" size="sm" color="primary" variant="solid" label="Lagre" :trailing="false" @click="submitForm" />
                </template>
            </template>
        </UCard>
    </UModal>
</template>

<script setup>
const supabase = useSupabaseClient()
const errorMessage = ref(undefined)
const modalIsOpen = ref(false)
const form = ref(null)
const politicians = ref([])
const roles = ref([])
const selectedPolitician = ref(undefined)
const selectedRole = ref(undefined)

const props = defineProps({
    council: {
        type: Object
    },
    buttonLabel: {
        type: String,
        default: 'Nytt medlem'
    },
    buttonColor: {
        type: String,
        default: 'primary'
    },
    title: {
        type: String,
        default: 'Nytt kommunestyremedlem'
    },
    class: {
        type: String
    }
})

const item = ref({
    politician: undefined,
    council: undefined,
    role: undefined
})

function openModal() {
    selectedPolitician.value = undefined
    selectedRole.value = undefined

    if (!politicians.value || politicians.value.length == 0) getPoliticians()
    if (!roles.value || roles.value.length == 0) getRoles()

    item.value = {
        politician: undefined,
        council: props.council.id,
        role: undefined
    }

    errorMessage.value = undefined
    modalIsOpen.value = true
}

const validate = (state) => {
    const errors = []
    if (!state.politician) errors.push({ path: 'politician', message: 'Påkrevet' })
    if (!state.council) errors.push({ path: 'council', message: 'Påkrevet' })
    if (!state.role) errors.push({ path: 'role', message: 'Påkrevet' })
    return errors
}

const submitForm = async () => {
    form.value.validate().then((success) => {
        if (success) addItem()
    }).catch(() => {
        errorMessage.value = 'Kunne ikke lagre endringer, sjekk at alle feltene er fylt ut korrekt.'
    })
}

async function addItem() {
    const { error } = await supabase
        .from('CouncilMembers')
        .insert([
            {
                politician: item.value.politician.id,
                council: item.value.council,
                role: item.value.role
            }
        ])
        .select()

    if (error) errorMessage.value = error.message
    else modalIsOpen.value = false
}

async function getPoliticians() {
    let { data } = await supabase
        .from('Politicians')
        .select('id,name,Parties (id, name)')
        .order('name')

    politicians.value = data
}

async function getRoles() {
    let { data } = await supabase
        .from('CouncilMemberRoles')
        .select('id,name,rank')
        .order('rank')

    roles.value = data
}

const searchPoliticians = async (q) => {
    if (!q) return politicians.value
    return politicians.value.filter((politician) => {
        return politician.name.toLowerCase().includes(q.toLowerCase()) || politician.Parties.name.toLowerCase().includes(q.toLowerCase())
    })
}
</script>