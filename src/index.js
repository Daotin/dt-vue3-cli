import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagePath = path.join(dirname(__dirname), 'package.json');
const package_json = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// 导入Generator
import Generator from './generator.js';

// 创建项目的方法
async function createProject(name, options) {
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
          name: 'dirAction',
          type: 'list',
          message: `${targetDir}目录已存在，请选择操作：`,
          choices: [
            {
              name: '覆盖',
              value: 'cover',
            },
            {
              name: '取消',
              value: 'cancel',
            },
          ],
        },
      ]);

      if (!dirAction) {
        // 未选择
        return;
      } else if (dirAction === 'cover') {
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
}

// 初始化CLI
function init() {
  program
    .name('dt-vue3-cli')
    .command('create <app-name>')
    .description('创建一个新项目')
    .option('-f, --force', '覆盖当前目录') // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
    .action((name, options) => {
      // 输入指令后的回调
      createProject(name, options);
    });

  // 配置版本号信息
  program.version(`v${package_json.version}`).usage('<command> [option]');

  // 配置额外的帮助信息
  program.on('--help', () => {
    // 使用figlet绘制logo
    console.log(
      '\r\n' +
        figlet.textSync('dt-vue3-cli', {
          // font: "Standard",
          // horizontalLayout: "default",
          // verticalLayout: "default",
          // width: 80,
          // whitespace: true,
        })
    );

    // 新增说明信息
    console.log(`\r\nRun ${chalk.greenBright(`dt-vue3-cli <command> --help`)} show details\r\n`);
  });

  program.parse();
}

// 执行CLI命令
init();
