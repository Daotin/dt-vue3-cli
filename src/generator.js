const ora = require("ora");
const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");

const util = require("util");
const downloadGitRepo = require("download-git-repo");

// 添加加载动画
async function loading(message, fn, ...args) {
  // 使用ora初始化，传入提示信息message
  const spinner = ora(message);
  // 开始动画
  spinner.start();

  try {
    // 执行传入方法fn
    const result = await fn(...args);
    // 状态改为成功
    spinner.succeed();
    return Promise.resolve(result);
  } catch (error) {
    // 状态改为失败
    spinner.fail("Request failed...");
    return Promise.reject(new Error(error));
  }
}

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 进行promise化处理。它返回一个新的函数，这个新函数与原来的 downloadGitRepo 函数功能相同，但返回的是一个 Promise 对象
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 创建方法
  async create() {
    console.log("Generator==>", this.name, this.targetDir);

    try {
      // 下载模版到目录
      await this.download();

      // 模版创建提示
      console.log(
        `\r\n🎉Init ${chalk.cyan(this.name)} Finished🎉. Injoy!\r\n  `
      );
      console.log(`  cd ${chalk.cyan(this.name)}`);
      console.log("  npm run dev\r\n");
    } catch (error) {
      console.error(error);
    }
  }

  // 下载远程模版
  async download() {
    // 询问用户仓库名称
    let { repoName } = await inquirer.prompt([
      {
        name: "repoName",
        type: "input",
        message: `Repo name：`,
        default: "create-vue3-template",
        choices: [
          {
            name: "覆盖",
            value: "cover",
          },
          {
            name: "取消",
            value: "cancel",
          },
        ],
      },
    ]);
    // 拼接下载地址。参考：https://www.npmjs.com/package/download-git-repo
    const repoUrl = `direct:https://github.com/Daotin/${repoName}.git`;
    const dir = path.resolve(process.cwd(), this.targetDir);

    console.log("repoUrl==>", repoUrl, dir);

    // 调用下载方法;
    await loading(
      "Downloading...", // 加载提示信息
      this.downloadGitRepo, // 下载方法
      repoUrl, // 下载地址
      dir, // 项目创建位置
      { clone: true } // 采用clone的方式下载
    );
  }
}

module.exports = Generator;
