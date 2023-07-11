#! /usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const figlet = require("figlet");
const package = require("../package.json");

program
  .name("dt-vue3-cli")
  .command("create <app-name>")
  .description("创建一个新项目")
  .option("-f, --force", "覆盖当前目录") // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .action((name, options) => {
    // 输入指令后的回调
    require("../src/index")(name, options);
  });

// 配置版本号信息
program.version(`v${package.version}`).usage("<command> [option]");

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
  console.log(
    `\r\nRun ${chalk.greenBright(
      `dt-vue3-cli <command> --help`
    )} show details\r\n`
  );
});

program.parse();
