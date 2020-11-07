import Vue from "vue";
import Router from "vue-router";
import Sign from "./views/Sign.vue";
import Info_me from "./views/Info_me";
import Post_list from "./views/Post_list";
import Post_View from "./views/Post_View";
import Post_Write from "./views/Post_Write";
import User_View from './views/User_View';
import Edit_View from './views/Edit_View';

//import History_View from './views/History_View';

Vue.use(Router); //플러그인 등록
export default new Router({
  routes: [
    {
      path: "/",
      component: Sign,
      name: "Main",
    },
    {
      path: "/info",
      component: Info_me,
      name: "info",
    },
    {
      path: "/post_list/:num",
      component: Post_list,
      name: "post_list/",
    },
    {
      path: "/post_view/:id",
      name: "post_view",
      component: Post_View,
      props: true,
    },
    {
      path: "/post_write",
      name: "post_write",
      component: Post_Write,
    },
    {
        path:"/user_view/:userid",
        name:"user_view",
        component:User_View,
    },
    {
        path:"/edit_view/:postid",
        name:"edit_view",
        component:Edit_View,
    },
  ],
});
