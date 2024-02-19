<!--suppress XmlInvalidId -->
<template>
  <form class="login" @submit.prevent="handleLoginAttempt">
    <img src="../assets/background.png" class="background" alt="" />
    <section class="login__item">
      <img src="../assets/logo.png" class="logo" alt="" v-if="root.$config.public.loginCompanyLogo" />
      <div v-else>
        <p class="company-logo">{{ root.$config.public.companyName }}</p>
      </div>
      <v-container fluid>
        <v-row>
          <v-col cols="12" sm="6">
            <label for="user-email">{{ $t('login.email') }}</label>
            <v-text-field
              solo
              elevation="0"
              class="input"
              type="email"
              id="user-email"
              v-model="formData.email"
            ></v-text-field>
            <label for="user-password">{{ $t('login.password') }}</label>
            <v-text-field
              solo
              elevation="0"
              class="input"
              type="password"
              id="user-password"
              v-model="formData.password"
            ></v-text-field>
            <v-btn color="primary" elevation="0" type="submit">{{ $t('login.enter') }}</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </form>
</template>

<script lang="ts">
import {error as showErrorMessage} from '../framework/messages';

export default defineComponent({
  setup() {
    const root = getCurrentInstance().proxy;

    const formData = reactive({
      email: '',
      password: '',
    });

    async function handleLoginAttempt() {
      try {
        await root.$auth.loginWith('local', {data: {email: formData.email, password: formData.password}});
      } catch (e) {
        if (e.response && e.response.status === 401) {
          showErrorMessage(root.$tc('login.incorrectLoginOrPassword'));
        } else {
          throw Error;
        }
      }
    }

    return {root, formData, handleLoginAttempt};
  },
});
</script>

<style scoped lang="sass">
.logo
  width: 300px
.company-logo
  margin: 20px auto 20px auto
  font-weight: bold
  font-size: 22px
  display: flex
  justify-content: center
  align-items: center
.background
  opacity: 0.16
  position: fixed
  width: 100%
  object-fit: cover
.login
  width: 100%
  height: 100vh
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  padding-bottom: 100px
  overflow: hidden
  div
    width: 100%
    max-width: 400px
    display: flex
    flex-direction: column
.login__item
  z-index: 9
  display: flex
  justify-content: center
  flex-direction: column
  align-items: center
  background-color: #ffffff
  width: 100%
  max-width: 600px
  box-shadow: 0px 2px 10px 0px #989898
  padding: 30px 60px
  padding-top: 20px
.input
  padding: 0px
</style>
