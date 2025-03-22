import ora from "ora";
import util from "util";
import downloadGitRepo from "download-git-repo";

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
