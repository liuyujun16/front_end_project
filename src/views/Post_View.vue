<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col>
          <v-row> <h2>标题</h2> </v-row>
        </v-col>
        <v-col>
          <v-btn
            block
            outlined
            color="blue"
            @click="editClick"
            v-show="my_display"
            
            >编辑
            <v-icon>mdi-clipboard-edit-outline</v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <v-btn block outlined color="blue" @click="bookClick" 
            >收藏
            <v-icon>mdi-bookmark-check-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row
        ><h1>{{ title }}</h1>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <v-btn block outlined color="blue" @click="onlyClick"
            >只看楼主
             <v-icon>mdi-head-check-outline</v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <v-btn block outlined color="blue" @click="userClick">
           {{ nickname }} <v-icon>mdi-account-circle-outline</v-icon> 
          </v-btn>
        </v-col>

        <v-col order="first">
          <v-card class="pa-2" outlined tile>
            {{ created }}
          </v-card>
        </v-col>
      </v-row>
      <v-row> <h2>内容</h2> </v-row>
      <v-row v-html="rawhtml"></v-row>

      <v-row>
        <v-col cols="15" md="10">
          <div>
            <quill-editor
              class="editor"
              ref="myTextEditor"
              :value="content_reply"
              :options="editorOption"
              @change="onEditorChange"
              @blur="onEditorBlur($event)"
              @focus="onEditorFocus($event)"
              @ready="onEditorReady($event)"
            />
          </div>
        </v-col>
        <v-col cols="15" md="2">
          <v-btn  outlined color="blue" @click="postClick"> post <v-icon>mdi-comment-processing-outline</v-icon></v-btn>
        </v-col>
      </v-row>

      <div id="styletest" is="tree" :data="treeData" v-show="display">
        <div slot-scope="{ item }">
          <div class="box">
            <h3>{{ item.nickname }}</h3>
            <br />

            <h3 v-html="item.name">
              {{ item.name }}
            </h3>
            <br />
            <h5>{{ item.createdAt }}</h5>

            <a @click="replyClick(item.nickname, item.id)"> 回复</a>
            <a @click="editreplyClick(item.nickname, item.id)"> 编辑</a>

            <div class="box" is="childTree" :data="item.child" />
          </div>
        </div>
      </div>
      <div class="text-center">
        <v-row>
          <v-col>
            <v-btn block outlined color="blue" @click="preClick">
              上一页 <v-icon>mdi-skip-previous</v-icon>
            </v-btn></v-col
          >
          <v-col>
            <v-btn block outlined color="blue" @click="nextClick">
              <v-icon>mdi-skip-next</v-icon>下一页
            </v-btn></v-col
          >
        </v-row>
      </div>
      <v-row>
        <v-col>
          <v-btn block outlined color="blue" @click="listClick"> 目录 <v-icon>mdi-menu</v-icon></v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
<script>
let result_tree = [];
let path;
let created_time;
let time;
let history = [];
let bookmark = [];
import axios from "axios";
import Post_View from "./Post_View.vue";
import LTT from "list-to-tree";
import Vue from "vue";
import dedent from "dedent";
import hljs from "highlight.js";
import debounce from "lodash/debounce";
import { quillEditor } from "vue-quill-editor";

//import stripHtml from "string-strip-html"
// highlight.js style
import "highlight.js/styles/tomorrow.css";

// import theme style
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";

Vue.component("tree", {
  name: "tree",
  props: ["data", "tag", "_depth"],
  render(h) {
    var data = this.$props.data || [];
    var tag = this.$props.tag || this.$vnode.data.tag || "ul";
    var depth = this.$props._depth || 0;
    var slot = this.$scopedSlots.default;

    var children = data.map((d, i) => {
      var context = { item: d, index: i, depth: depth };
      return slot(context);
    });

    return h(tag, children);
  },
});

function findParentTree(vm) {
  if (!vm) return null;
  if (
    vm.$vnode &&
    vm.$vnode.componentOptions &&
    vm.$vnode.componentOptions.tag === "tree"
  )
    return vm;
  if (!vm.$parent) return null;
  return findParentTree(vm.$parent);
}

Vue.component("childTree", {
  name: "childTree",
  props: ["data", "tag"],
  render(h) {
    var parentTree = findParentTree(this);
    if (!parentTree) return h("");

    var data = this.$props.data || [];
    var tag = this.$props.tag || this.$vnode.data.tag || "ul";
    var parentDepth = parentTree.$props._depth || 0;
    var slot = parentTree.$scopedSlots.default;

    if (!slot) return h(tag);

    return h("tree", {
      props: { data: data, tag: tag, _depth: parentDepth + 1 },
      scopedSlots: { default: slot },
    });
  },
});

export default {
  name: "Post_View",
  components: {
    Post_View,
    quillEditor,
  },
  //   beforeMount: function() {
  //         messagetree.$on('on-reply');
  //         console.log('please') //이벤트를 받기 위함
  // },

  created() {
    //var messagetree = new MessageTree(this.tree);

    this.my_display = false;
    path = window.location.href;
    path = path.split("#");
    path[1] = path[1].slice(11);
    console.log("what is postid", path[1]);
    this.fetch();
  },
  methods: {
    fetch() {
      axios
        .get(`http://simplebbs.iterator-traits.com/api/v1/post/` + path[1], {
          headers: {
            Authorization: this.$store.state.token,
          },
        })
        .then((r) => {
          // let reply = {};

          //console.log(r);
          let small = r.data.content;
          this.title = r.data.title;
          while (small.includes("<img src=")) {
            console.log("contetn is ");

            small = small.replace(
              "<img src=",
              '<img style="max-height:500px;height: expression(this.height > 500 ? 500: true);max-width:500px;width: expression(this.width > 500 ? 500: true);" src='
            );
            small = small.replace("/img>", "/p>");
          }
          this.rawhtml = small;
          ////emoji
          this.content = this.content.replace("😀", "#笑");
          this.content = this.content.replace("😷", "#生病");
          this.content = this.content.replace("😂", "#哭笑");
          this.content = this.content.replace("😝", "#调皮");
          this.content = this.content.replace("😳", "#惊讶");
          this.content = this.content.replace("😱", "#恐怖");
          this.content = this.content.replace("😔", "#忧郁");
          this.content = this.content.replace("😒", "#不耐烦");
          this.content = this.content.replace("🙄", "#哇");
          this.content = this.content.replace("😩", "#好累");
          this.content = this.content.replace("🤔", "#想一想");
          this.content = this.content.replace("👻", "#鬼");
          this.content = this.content.replace("🙈", "#猴子");
          this.content = this.content.replace("🙏", "#谢谢");
          this.content = this.content.replace("💪", "#强壮");
          this.content = this.content.replace("👊", "#拳头");
          this.content = this.content.replace("💯", "#一百分");
          this.content = this.content.replace("🍻", "#啤酒");
          this.content = this.content.replace("🎁", "#礼物");
          this.content = this.content.replace(
            ' <img src=https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT-r-V49N0wM_Fmz8djUiCJPaBur4883lv5Dg&usqp=CAU  style="max-width: 100%;">',
            "#我的自定义表情#"
          );

          created_time = r.data.created.split("T");
          time = created_time[1].split("+");
          this.created = created_time[0] + "/" + time[0];
          this.nickname = r.data.nickname;
          this.userId = r.data.userId;
          if (Number(this.userId) === Number(7)) {
            this.my_display = true;
          }
          this.reply_length = r.data.reply.length;
          console.log(this.reply_length);
          if (!Array.isArray(localStorage.getItem("history"))) {
            history.push(path[1]);
            console.log(history);
            //console.log('fucking postid',Number(path[1]));

            localStorage.setItem("history", history);
          }
          if (Array.isArray(localStorage.getItem("history"))) {
            history = localStorage.getItem("history");
            localStorage.push(path[1]);
            console.log(history);

            storage.setItem("history", history);
          }
          for (let i = 0; i < this.reply_length; i++) {
            this.reply[i] = new Object();
            console.log("new");
          }
          for (let i = 0; i < this.reply_length; i++) {
            created_time = r.data.reply[i].created.split("T");
            time = created_time[1].split("+");
            this.reply[i].replyId = r.data.reply[i].replyId;
            this.reply[i].id = r.data.reply[i].id;
            this.reply[i].createdAt = created_time[0] + "/" + time[0];

            this.reply[i].nickname = r.data.reply[i].nickname;
            // this.reply[i].content = r.data.reply[i].content;
            // this.reply[i].children = null;
            // this.reply[i].id = i+1;
            //var temp = stripHtml(r.data.reply[i].content).result
            //md=r.data.reply[i].content;
            // var el = document.createElement("html");
            // el.innerHTML = r.data.reply[i].content;
            // el.getElementsByTagName( 'a' );
            //yScriptContents =
            // this.reply[i].content =document.querySelector(".box");
            this.reply[i].name = r.data.reply[i].content;
            //this.reply[i].content = r.data.reply[i].content;
          }

          for (let i = 0; i < this.reply_length; i++) {
            //this.reply[i].id = i + 1;
            this.result_reply.push(this.reply[i]);
          }

          let list = this.result_reply;
          this.result_reply = [];
          //console.log("children", list);

          var ltt = new LTT(list, {
            key_id: "id",
            key_parent: "replyId",
          });
          this.tree = ltt.GetTree();
          //preOrderTree(tree)
          console.log('this is tree',this.tree);

          var arrays = [],
            size = 5;

          while (this.tree.length > 0)
            this.result_reply.push(this.tree.splice(0, size));
          this.count_com = this.result_reply.length;

          this.treeData = this.result_reply[0];

          console.log(this.count_com);
          //console.log(this.treeData)

          //console.log(treeData)
          //console.log(tree);
        })
        .catch((e) => {
          //alert("error");
          console.log(e);
        });
    },

    bookClick() {
      if (!Array.isArray(localStorage.getItem("bookmark"))) {
        bookmark.push(path[1]);
        console.log(bookmark);
        console.log("bookmark postid", path[1]);
        //console.log('fucking postid',Number(path[1]));
        console.log(localStorage.getItem("bookmark"));

        localStorage.setItem("bookmark", bookmark);
      }
      if (Array.isArray(localStorage.getItem("bookmark"))) {
        bookmark = localStorage.getItem("bookmark");
        localStorage.push(path[1]);
        console.log(bookmark);

        console.log("bookmark postid", path[1]);
        console.log(localStorage.getItem("bookmark"));

        storage.setItem("bookmark", bookmark);
      }
    },
    postClick() {
      //console.log(path);
      console.log("포스트아이디야", this.post_id);
      if (this.post_id === 0 && this.post_reply === 0) {
        axios
          .post(
            `http://simplebbs.iterator-traits.com/api/v1/post/` +
              path[1] +
              "/reply",
            this.$data,
            {
              headers: {
                Authorization: this.$store.state.token,
              },
            }
          )
          .then((r) => {
            //console.log(r);
            location.reload();
          })
          .catch((e) => {
            alert("error");
            console.log("error");
          });
      } else if (this.post_id !== 0) {
        let body = {
          content: this.$data.content,
          replyId: this.post_id,
        };
        console.log(body);
        axios
          .post(
            `http://simplebbs.iterator-traits.com/api/v1/post/` +
              path[1] +
              "/reply",
            body,
            {
              headers: {
                Authorization: this.$store.state.token,
              },
            }
          )
          .then((r) => {
            //console.log(r);
            console.log("success");
            this.post_id = 0;
            location.reload();
          })
          .catch((e) => {
            alert("error");
            console.log("error");
          });
      } else if (this.post_reply !== 0) {
        let content = this.$data.content;
        console.log(this.post_reply);
        console.log(content);
        let body = {
          content: this.$data.content,
        };
        axios
          .put(
            `http://simplebbs.iterator-traits.com/api/v1/post/` +
              path[1] +
              "/reply/" +
              this.post_reply,
            body,
            {
              headers: {
                Authorization: this.$store.state.token,
              },
            }
          )
          .then((r) => {
            //console.log(r);
            console.log("success");
            this.post_reply = 0;
            location.reload();
          })
          .catch((e) => {
            alert("error");
            console.log("error");
          });
      }
    },

    editreplyClick(nickname, replyId) {
      if (nickname !== "刘宇埈") {
        alert("你不能修改他人的回帖");
      }

      //console.log('please',replyId);
      //console.log('please',nickname);
      //console.log('please',id);

      this.content_reply = "@编辑";

      // for(let i=0;i<this.reply_length;i++){
      //   if(this.reply[i].replyId === replyId)
      //   {
      //     console.log(this.reply[i].nickname);
      //   }
      // }
      // this.post_id = id;
      this.post_reply = replyId;
    },

    replyClick(nickname, id) {
      //console.log('please',replyId);
      console.log("please", nickname);
      console.log("please", id);

      this.content_reply = "@" + nickname;

      // for(let i=0;i<this.reply_length;i++){
      //   if(this.reply[i].replyId === replyId)
      //   {
      //     console.log(this.reply[i].nickname);
      //   }
      // }
      this.post_id = id;
    },
    nextClick() {
      if (this.count < this.count_com - 1) {
        this.count += 1;

        this.treeData = this.result_reply[this.count];
        console.log(this.treeData);
      }
    },
    preClick() {
      if (this.count > 0) {
        this.count -= 1;
        this.treeData = this.result_reply[this.count];
      }
    },
    onlyClick() {
      this.num += 1;
      if (this.num % 2 === 1) {
        this.display = false;
        console.log(this.display);
      } else {
        this.display = true;
        console.log(this.display);
      }
    },
    listClick() {
      this.$router.push("/post_list/1");
    },
    userClick(userId) {
      this.$router.push("/user_view/" + this.userId);
    },
    editClick() {
      this.$router.push("/edit_view/" + path[1]);
    },
    onEditorChange: debounce(function (value) {
      this.content = value.html;
    }, 466),
    onEditorBlur(editor) {
      console.log("editor blur!", editor);
    },
    onEditorFocus(editor) {
      console.log("editor focus!", editor);
    },
    onEditorReady(editor) {
      console.log("editor ready!", editor);
    },
  },

  computed: {
    editor() {
      return this.$refs.myTextEditor.quill;
    },
    contentCode() {
      return hljs.highlightAuto(this.content).value;
    },
  },
  mounted() {
    console.log("this is Quill instance:", this.editor);
  },

  data() {
    return {
      post_reply: 0,
      post_id: 0,
      content_reply: "",
      reply_length: "",
      result_reply: [],
      count: 0,
      count_com: 0,
      display_quil: false,
      treeData: [],
      tree: [],
      my_display: "",
      num: 0,
      display: "true",
      items: [],
      title: "",
      nickname: "",
      created: "",
      model: {
        content: "",
      },
      reply: {
        content: "",
        nickname: "",
        created: "",
        userId: "",
        id: "",
      },

      form: {
        content: "",
      },
      headers: [
        {
          text: "created",
          value: "created",
        },

        {
          text: "name",
          value: "nickname",
        },
        {
          text: "content",
          value: "content",
        },
        {
          text: "id",
          value: "id",
        },
        {
          text: "replyId",
          value: "replyId",
        },
      ],
      desserts: [{}],

      editorOption: {
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["clean"],
            ["link", "image", "video"],
          ],
          syntax: {
            highlight: (text) => hljs.highlightAuto(text).value,
          },
        },
      },
      content: dedent``,
    };
  },
};
</script>
<style scoped>
.box {
  border: 0.5px #e6e6e6 solid;
  margin-left: 40px;
}
</style>
