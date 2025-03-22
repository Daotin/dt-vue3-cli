import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../utils/index.js";
import semver from "semver";
import chalk from "chalk";
import { getVersionInfo } from "../utils/checkUpdate.js";

// 将exec转为Promise
const execPromise = promisify(exec);

/**
 * 执行更新命令
 * @param {string} packageName 包名
 * @returns {Promise<string>} 命令输出
 */
async function executeUpdate(packageName) {
  try {
    logger.info(`正在更新 ${packageName}...`);
    // 执行全局安装命令
    const { stdout, stderr } = await execPromise(
      `npm install -g ${packageName}`
    );

    if (
      stderr &&
      !stderr.includes("npm WARN") &&
      !stderr.includes("npm notice")
    ) {
      throw new Error(stderr);
    }

    return stdout;
  } catch (error) {
    throw new Error(`更新失败: ${error.message}`);
  }
}

/**
 * 更新CLI到最新版本
 */
export async function updateCLI() {
  try {
    // 获取版本信息
    const { currentVersion, latestVersion } = await getVersionInfo();

    // 如果获取不到最新版本或版本相同，则认为当前是最新版本
    if (!latestVersion || currentVersion === latestVersion) {
      logger.info(`当前已是最新版本 ${chalk.green(currentVersion)}`);
      return false;
    }

    // 检查是否需要更新
    if (semver.lt(currentVersion, latestVersion)) {
      logger.info(
        `正在从 ${chalk.yellow(currentVersion)} 更新到 ${chalk.green(
          latestVersion
        )}...`
      );

      // 执行更新
      const result = await executeUpdate(
        process.env.npm_package_name || "dt-vue3-cli"
      );

      logger.success(`更新成功! 现在版本是 ${chalk.green(latestVersion)}`);
      logger.info("更新日志:");
      logger.info(result);

      return true;
    } else {
      logger.info(`当前已是最新版本 ${chalk.green(currentVersion)}`);
      return false;
    }
  } catch (error) {
    logger.error(`更新失败: ${error.message}`);
    logger.info(
      `可以尝试手动更新: ${chalk.cyan("npm install -g dt-vue3-cli")}`
    );
    return false;
  }
}
