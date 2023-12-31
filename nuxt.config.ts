// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig(
  {
    runtimeConfig:
      {
        powerAutomate:
          "",
      },
    devtools:
      {
        enabled:
          true,
      },
    modules:
      [
        "@nuxt/ui",
        "@nuxtjs/supabase",
      ],
    supabase:
      {},
    build:
      {
        transpile:
          [
            "@vuepic/vue-datepicker",
          ],
      },
  }
);
