module.exports = {
  devServer:{
    historyApiFallback: false,
    proxy:{
      '/api':{
        target:'http://simplebbs.iterator-traits.com',
        ws:true,
        changeOrgin:true
      }
    }
  },
  
  "transpileDependencies": [
    "vuetify"
  ],
  lintOnSave : false
}