import { createApp } from 'vue';
import App from './App.vue';
import Tooltip from './components/Tooltip.vue';
import Toast from './components/Toast.vue';

const app = createApp(App);
app.use(Toast);
app.use(Tooltip);

app.mount('#app');
