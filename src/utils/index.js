import ora from "ora";
import util from "util";
import downloadGitRepo from "download-git-repo";
import logSymbols from "log-symbols";
import chalk from "chalk";

// 添加加载动画
export async function loading(message, fn, ...args) {
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

// 将downloadGitRepo转换为Promise形式
export const downloadRepo = util.promisify(downloadGitRepo);

// 封装日志方法
export const logger = {
  // 成功信息
  success(text) {
    console.log(logSymbols.success, chalk.green(text));
  },
  // 错误信息
  error(text) {
    console.log(logSymbols.error, chalk.red(text));
  },
  // 提示信息
  info(text) {
    console.log(logSymbols.info, chalk.blue(text));
  },
  // 警告信息
  warn(text) {
    console.log(logSymbols.warning, chalk.yellow(text));
  },
};
