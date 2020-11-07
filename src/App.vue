<template>

  <v-app>
       <title>Vue.js Sample</title>

    <v-navigation-drawer
      persistent
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >

      <v-list>
        <v-list-item
          value="true"
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
        >
          <v-list-item-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      菜单
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu bottom left>
          <v-btn v-on="on" icon slot="activator">
          </v-btn>
          <v-list>
            <v-list-item
              v-if="!$store.state.token"
              @click="$router.push('sign')"
            >
              <v-list-item-title>로그인</v-list-item-title>
            </v-list-item>
            <v-list-item v-else @click="signOut">
              <v-list-item-title>로그아웃</v-list-item-title>
            </v-list-item>
          </v-list>
       <vue-audio
    audio-source="https://example.com/example.mp3"
    autoplay="true"
  ></vue-audio>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
    
    
  </v-app>
</template>

<script>
import Sign from "./views/Sign";
import Vue from 'vue'
import VueAudio from 'vue-audio-better'
// async function move_info(){
//   if(this.$store.state.token)
// {
//   console.log('fuckyou');
//     this.$router.push({ name: 'info'})

// }

// }
// move_info();
Vue.use(VueAudio)

export default {
  name: "App",
  data() {
    return {
      drawer: null,
      items: [
        {
          icon: "mdi-account-tie",
          title: "信息",
          to: {
            path: "/info",
          },
        },
        {
          icon: "mdi-forum",
          title: "论坛",
          to: {
            path: "/post_list/1",
          },
        },
        
      ],
      title: this.$apiRootPath,
    };
  },
  mounted() {},
  methods: {
    signOut() {
      // localStorage.removeItem('token')
      console.log("logout!!!");
      this.$store.commit("delToken");
      this.$router.push("/");
    },
    play(){
      
    }
 
  },

  
};

</script>
