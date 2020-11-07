<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>清华BBS</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="form.username"
                label="用户名"
                type="text"
              ></v-text-field>
              <v-text-field
                v-model="form.password"
                label="密码"
                type="password"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="signIn">登录<v-icon>mdi-login</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import Info_me from "./Info_me";
import jwtDecode from "jwt-decode";
import Vue from "vue";
//여기도 있어요오오오오오오
// async function move_info(){
//   if(this.$store.state.token)
// {
//   console.log('fuckyou');
//     this.$router.push({ name: 'info'})

// }

// }
// move_info();
// let body={
//     "username":"2016080044",
//     "password":"976682"
//   }
// async function getdata(){
//   var token;
//   var createError = require('http-errors');
//   await axios.patch(`http://simplebbs.iterator-traits.com/api/v1/login`,body )
//     .then((r)=> {console.log(r.data);
//     token = r.data.jwt;
//     })
//     .catch(e => console.error(e.message))

//     await axios.get(' http://simplebbs.iterator-traits.com/api/v1/hello-user', {

//       headers: {
//         'Authorization': token
//       }
//     }).then((r)=> {
//       console.log(r.data);
//         })
//     .catch(e => console.error(e.message));

//     }
//   getdata();

export default {
  name: "Sign",
  data() {
    return {
      form: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    signIn() {
      axios
        .patch(`http://simplebbs.iterator-traits.com/api/v1/login`, this.form)
        .then((r) => {
          console.log(r.data);

          //화면 넘어가고
          //토큰 저장하고
          //시간 저장하셈
          // var token = r.data.jwt;
          localStorage.setItem("token", r.data.jwt);
          console.log("aaaaa");

          console.log(localStorage.getItem("token"));
          console.log("aaaaa");
          this.$store.commit("getToken");
          console.log("bbbbb");

          this.$router.push({ name: "post_list/" });
          console.log("ccccc");
          //여기에용오오오오오오오

          let decoded = jwtDecode(r.data.jwt);
          localStorage.setItem("exp", decoded.exp);

          // var decoded = jwtDecode(r.data.jwt);
          //           console.log(decoded,"time");
          //           storage.set('token', decoded.exp);
          //     var dateNow = new Date();
          //     if(this.$store.commit('getToken')!==undefined){
          //              console.log(this.$store.commit('getToken')*1000,"exp")
          //              console.log(dateNow.getTime(),"date");
          //        if(this.$store.commit('getToken')*1000< dateNow.getTime()){
          //          alert("get the fuck out");
          //        }
          //       }
          //router.push('hello')
          //  return{

          //    childData:token
          //  }
        })
        .catch(
          (e) => {console.log(this.form)
          alert('wrong user')}
          // alerting();
        ); //에러뜨면 알람
    },
  },
  mounted: function () {
    if (this.$store.state.token) {
      console.log("fuckyou");
      this.$router.push({ name: "post_list/" });
    }
  },
  // components:{
  //   'hello':Hello
  // }
};
</script>
