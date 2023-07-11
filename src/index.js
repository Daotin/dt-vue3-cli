const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");

const Generator = require("./generator");

module.exports = async function (name, options) {
  // 当前命令行选择的目录
  const cwd = process.cwd();
  // 需要创建的目录地址
  const targetDir = path.join(cwd, name);
  console.log(targetDir);
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
        console.log(`\r\nRemoving...`);
        await fs.remove(targetDir);
      }
    }
  }

  // 创建项目
  const generator = new Generator(name, targetDir);

  // 开始创建项目
  generator.create();
};
