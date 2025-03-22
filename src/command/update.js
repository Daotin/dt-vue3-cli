import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../utils/index.js";
import semver from "semver";
import chalk from "chalk";
import { getVersionInfo } from "../utils/checkUpdate.js";
import pkg from "../../package.json" assert { type: "json" };
import { execSync } from "child_process";

// 将exec转为Promise
const execPromise = promisify(exec);

/**
 * 获取实际安装的CLI版本
 * @param {string} packageName 包名
 * @returns {string|null} 版本号或null
 */
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
    return null;
  } catch (error) {
    return null;
  }
}

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

    // 只有当stderr中包含ERROR时才认为是真正的错误
    // npm warn和npm notice只是警告信息，不影响安装
    if (stderr && stderr.includes("npm ERR!")) {
      throw new Error(stderr);
    }

    // 记录警告信息，但不视为错误
    if (
      stderr &&
      (stderr.includes("npm WARN") ||
        stderr.includes("npm warn") ||
        stderr.includes("deprecated"))
    ) {
      logger.warn("安装过程中有警告信息（不影响使用）:");
      logger.warn(stderr);
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
    // 获取更新前的版本信息
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
      const result = await executeUpdate(pkg.name);

      // 验证更新后的版本
      const updatedVersion = getInstalledVersion(pkg.name);
      if (updatedVersion && semver.gte(updatedVersion, latestVersion)) {
        logger.success(`更新成功! 现在版本是 ${chalk.green(updatedVersion)}`);
        if (result && result.trim()) {
          logger.info("更新日志:");
          logger.info(result);
        }
        return true;
      } else {
        logger.warn(`更新可能未完全成功，请尝试手动更新`);
        logger.info(
          `手动更新命令: ${chalk.cyan(`npm install -g ${pkg.name}@latest`)}`
        );
        return false;
      }
    } else {
      logger.info(`当前已是最新版本 ${chalk.green(currentVersion)}`);
      return false;
    }
  } catch (error) {
    logger.error(`更新失败: ${error.message}`);
    logger.info(
      `可以尝试手动更新: ${chalk.cyan(`npm install -g ${pkg.name}`)}`
    );
    return false;
  }
}
