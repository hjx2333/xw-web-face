const { defineConfig } = require("@vue/cli-service");
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = defineConfig({
  transpileDependencies: true,
    configureWebpack: (config) => {
    config.cache = {
      type: "filesystem",
      compression: "gzip",
    };
  },
  chainWebpack: (config) => {
    config.resolve.alias.set("@", resolve("src"));
    config.resolve.symlinks(true);
  },
  devServer: {
    host: "localhost",
    open: true,
    client: {
      // 全屏显示编译错误或警告
      overlay: {
        warnings: true,
        errors: true,
      },
    },
  }
});
