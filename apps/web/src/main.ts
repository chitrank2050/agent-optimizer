/**
 * Web application entry point.
 *
 * Mounts the Vue dashboard and loads the global Tailwind/CSS token layer.
 */
import { createApp } from 'vue';

import App from './App.vue';
import './styles.css';

createApp(App).mount('#app');
