import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import store from "./store";

let dateNow = new Date();
if (localStorage.getItem("token") === null) {
  console.log('pleaseeeee')
  router.push({ name: "Main" });

}
else if(localStorage.getItem("exp") !== null)
{
  console.log(localStorage.getItem("exp") * 1000, "exp");
  console.log(dateNow.getTime(), "date");
  if (localStorage.getItem("exp") * 1000 < dateNow.getTime()) {
    localStorage.removeItem("token");
    localStorage.removeItem("exp");

    alert("token is expired");
    
  router.push("/" );
  }
 
}

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: (h) => h(App),
  router,
  store,
}).$mount("#app");
