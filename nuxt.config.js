export default {
    // Global page headers (https://go.nuxtjs.dev/config-head)
    head: {
        title: 'HR Doodle',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: '' }
        ],
        link: [
          
        ]
    },

    // Global CSS (https://go.nuxtjs.dev/config-css)
    css: [
        'vue-json-pretty/lib/styles.css',
    ],

    // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
    plugins: [
        '@/plugins/vue-json-pretty.js',
        '@/plugins/vue-konva.client.js',
    ],

    // Auto import components (https://go.nuxtjs.dev/config-components)
    components: {
        global: true,
        dirs: ['~/components'],
    },

    // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
    buildModules: [
    ],

    // Modules (https://go.nuxtjs.dev/config-modules)
    modules: [
        // https://go.nuxtjs.dev/bootstrap
        'bootstrap-vue/nuxt',
    ],

    // Build Configuration (https://go.nuxtjs.dev/config-build)
    build: {
    }
}
