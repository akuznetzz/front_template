import Vue from 'vue';
import VueAWN from 'vue-awesome-notifications';

// Custom options
const options = {
  labels: {
    confirm: 'Требуется подтверждение',
    confirmOk: 'Да',
    confirmCancel: 'Нет',
    success: 'Успешно',
    warning: 'Внимание',
  },
  position: 'top-right',
};

Vue.use(VueAWN, options);
