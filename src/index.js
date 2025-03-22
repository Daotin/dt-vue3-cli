import path from "path";
import fs from "fs-extra";
import inquirer from "inquirer";
import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";

// 导入创建项目命令
import createProject from "./command/create.js";
import { updateCLI } from "./command/update.js";
import { logger } from "./utils/index.js";
import { checkUpdate } from "./utils/checkUpdate.js";
import pkg from "../package.json" assert { type: "json" };

// 获取实际安装的CLI版本
function getInstalledVersion(packageName) {
  try {
    // 使用npm list -g获取全局安装的版本
    const output = execSync(`npm list -g ${packageName} --json`, {
      encoding: "utf8",
    });
    const npmInfo = JSON.parse(output);
    // 从dependencies中获取实际版本
    if (npmInfo && npmInfo.dependencies && npmInfo.dependencies[packageName]) {
      return npmInfo.dependencies[packageName].version;
    }
    return pkg.version;
  } catch (error) {
    return pkg.version;
  }
}

// 创建项目的方法
async function handleCreate(name, options) {
  // 当前命令行选择的目录
  const cwd = process.cwd();
  // 需要创建的目录地址
  const targetDir = path.join(cwd, name);
  // 目录是否已存在
  if (fs.existsSync(targetDir)) {
    // 是否创建创建
    if (options.force) {
      // 删除已存在的目录
      await fs.remove(targetDir);
    } else {
      // 询问用户是否确定要覆盖
      let { dirAction } = await inquirer.prompt([
        {
          name: "dirAction",
          type: "list",
          message: `${targetDir}目录已存在，请选择操作：`,
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

      if (!dirAction) {
        // 未选择
        return;
      } else if (dirAction === "cover") {
        // 移除已存在的目录
        logger.warn(`正在删除目录: ${targetDir}`);
        await fs.remove(targetDir);
      }
    }
  }

  // 调用创建项目函数
  createProject(name, targetDir);
}

// 初始化CLI
async function init() {
  program
    .name("dt-vue3-cli")
    .command("create <app-name>")
    .description("创建一个新项目")
    .option("-f, --force", "覆盖当前目录") // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
    .action((name, options) => {
      // 首先检查更新
      checkUpdate().then(() => {
        // 输入指令后的回调
        handleCreate(name, options);
      });
    });

  // 添加版本检查命令
  program
    .command("update-check")
    .description("检查版本更新")
    .action(async () => {
      const hasUpdate = await checkUpdate();
      if (!hasUpdate) {
        const currentVersion = getInstalledVersion(pkg.name);
        logger.info(`当前已是最新版本 ${chalk.green(currentVersion)}`);
      }
    });

  // 添加更新命令
  program
    .command("update")
    .description("更新CLI到最新版本")
    .action(async () => {
      await updateCLI();
    });

  // 配置版本号信息
  program
    .version(`v${getInstalledVersion(pkg.name)}`, "-v, --version", "显示版本号")
    .usage("<command> [option]");

  // 配置额外的帮助信息
  program.on("--help", () => {
    // 使用figlet绘制logo
    console.log(
      "\r\n" +
        figlet.textSync("dt-vue3-cli", {
          // font: "Standard",
          // horizontalLayout: "default",
          // verticalLayout: "default",
          // width: 80,
          // whitespace: true,
        })
    );

    // 新增说明信息
    logger.info(
      `Run ${chalk.greenBright(`dt-vue3-cli <command> --help`)} show details`
    );
  });

  // 仅在执行命令而不是查看版本号时检查更新
  if (!process.argv.includes("-v") && !process.argv.includes("--version")) {
    // 延迟执行版本检查，确保不干扰主要命令输出
    setTimeout(async () => {
      await checkUpdate();
    }, 100);
  }

  program.parse();
}

// 执行CLI命令
init();
