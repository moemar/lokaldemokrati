<template>
    <div class="min-h-screen bg-gray-900">
        <AppHeader />
        <div class="bg-gray-100">
            <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 sm:py-6">
                <slot />
            </div>
        </div>
        <AppFooter />
    </div>
</template>