import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import { loading, downloadRepo, logger } from "../utils/index.js";

// 下载远程模版
async function downloadTemplate(name, targetDir) {
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
  const dir = path.resolve(process.cwd(), targetDir);

  logger.info(`下载地址: ${repoUrl}`);
  logger.info(`目标目录: ${dir}`);

  // 调用下载方法
  await loading(
    "Downloading...", // 加载提示信息
    downloadRepo, // 下载方法
    repoUrl, // 下载地址
    dir, // 项目创建位置
    { clone: true } // 采用clone的方式下载
  );
}

// 创建项目函数
async function createProject(name, targetDir) {
  logger.info(`开始创建项目: ${name}`);

  try {
    // 下载模版到目录
    await downloadTemplate(name, targetDir);

    // 模版创建提示
    logger.success(`🎉Init ${chalk.cyan(name)} Finished🎉. Injoy!`);
    logger.info(`  cd ${chalk.cyan(name)}`);
    logger.info("  npm run dev");
  } catch (error) {
    logger.error(`创建项目失败: ${error.message}`);
  }
}

export default createProject;
