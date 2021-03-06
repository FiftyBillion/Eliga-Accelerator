import Vue from 'vue'
import Vuex from 'vuex'
import ProductBacklog from './ProductBacklog'
import SprintBacklog from './SprintBacklog'
import Sprint from './Sprint'
import axios from 'axios'
import VueAxios from 'vue-axios'
import auth0 from 'auth0-js'
import router from '../router'
import Task from '../store/Task'
import People from '../store/People'
import Burndown from '../store/Burndown'

Vue.use(Vuex)
Vue.use(VueAxios, axios)

export default new Vuex.Store({
  state: {
    userIsAuthorized:false,
    auth0: new auth0.WebAuth({
      domain: process.env.VUE_APP_AUTH0_CONFIG_DOMAIN,
      clientID: process.env.VUE_APP_AUTH0_CONFIG_CLIENTID,
      redirectUri: process.env.VUE_APP_DOMAINURL + '/auth0callback', // http://eliga.s3-website-us-west-2.amazonaws.com/auth0callback
      responseType: process.env.VUE_APP_AUTH0_CONFIG_RESPONSETYPE,
      scope: process.env.VUE_APP_AUTH0_CONFIG_SCOPE,
    }),
    profile: ''
  }, 
  mutations: {
    setUserIsAuthenticated(state, replacement){
      state.userIsAuthorized = replacement;
    }
  },
  actions: {
    auth0Login(context) {
      context.state.auth0.authorize()
    },
    auth0HandleAuthentication (context) {
      context.state.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          let expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime() // Time for token expiration
          )
          // Save the tokens locally
          localStorage.setItem('access_token', authResult.accessToken);
          localStorage.setItem('id_token', authResult.idToken);
          localStorage.setItem('expires_at', expiresAt);
          localStorage.setItem('profilename', authResult.idTokenPayload.name)
          localStorage.setItem('profilepicture', authResult.idTokenPayload.picture)
          //context.state.profile = authResult.idTokenPayload
          //console.log(context.state.profile)
          router.replace('/');
        }
        else if (err) {
          alert('login failed. Error #KJN838');
          router.replace('/login');
        }
      })
    },
    auth0Logout () {
      // No need to update the bearer in global axiosConfig to null because we are redirecting out of the application
      // Clear Access Token and ID Token from local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');

      // redirect to auth0 logout to completely log the user out
      router.replace('/login');
      //window.location.href = process.env.VUE_APP_AUTH0_CONFIG_DOMAINURL + "/v2/logout?returnTo=" + process.env.VUE_APP_DOMAINURL + "/login&client_id=" + process.env.VUE_APP_AUTH0_CONFIG_CLIENTID; 
    }, 

  },
  modules: {
    ProductBacklog,
    SprintBacklog,
    Sprint,
    Task,
    People,
    Burndown
  }
})
