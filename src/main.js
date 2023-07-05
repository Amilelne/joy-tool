import { createApp } from 'vue';
import App from './App.vue';
import Tooltip from './components/Tooltip.vue';
import Toast from './components/Toast.vue';
import MySelect from './common/MySelect.vue';
import clickOutside from './directives/clickOutside';

const app = createApp(App);
app.directive('click-outside', clickOutside);

app.use(Toast);
app.use(Tooltip);
app.component('my-select', MySelect);

app.mount('#app');
