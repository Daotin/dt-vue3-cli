import axios from "axios";
import semver from "semver";
import { logger } from "./index.js";
import chalk from "chalk";
import pkg from "../../package.json" assert { type: "json" };
import { execSync } from "child_process";

/**
 * 获取版本信息
 * @returns {Promise<{currentVersion: string, latestVersion: string}>}
 */
export async function getVersionInfo() {
  try {
    let currentVersion;

    // 尝试通过命令获取实际安装的版本
    try {
      // 使用npm list -g获取全局安装的版本
      const output = execSync(`npm list -g ${pkg.name} --json`, {
        encoding: "utf8",
      });
      const npmInfo = JSON.parse(output);
      // 从dependencies中获取实际版本
      if (npmInfo && npmInfo.dependencies && npmInfo.dependencies[pkg.name]) {
        currentVersion = npmInfo.dependencies[pkg.name].version;
      } else {
        // 如果获取不到，使用package.json中的版本
        currentVersion = pkg.version;
      }
    } catch (error) {
      // 如果执行命令失败，使用package.json中的版本
      currentVersion = pkg.version;
      if (process.env.NODE_ENV === "development") {
        logger.warn(`无法获取实际安装版本: ${error.message}`);
      }
    }

    let latestVersion = currentVersion; // 默认值为当前版本

    try {
      // 获取npm上最新版本
      const { data } = await axios.get(
        `https://registry.npmjs.org/${pkg.name}`
      );

      // 最新版本
      latestVersion = data["dist-tags"]?.latest || currentVersion;
    } catch (npmError) {
      // npm请求失败，仍然返回当前版本，但在开发环境下记录错误
      if (process.env.NODE_ENV === "development") {
        logger.error(`获取npm版本失败: ${npmError.message}`);
      }
    }

    return {
      currentVersion,
      latestVersion,
    };
  } catch (error) {
    throw new Error(`获取版本信息失败: ${error.message}`);
  }
}

/**
 * 检查版本更新
 * @returns {Promise<boolean>} 是否有更新
 */
export async function checkUpdate() {
  try {
    // 获取版本信息
    const { currentVersion, latestVersion } = await getVersionInfo();

    // 如果当前版本低于最新版本，提示更新
    if (
      currentVersion &&
      latestVersion &&
      semver.lt(currentVersion, latestVersion)
    ) {
      logger.warn("-------------------------");
      logger.warn(`发现新版本: ${chalk.green(latestVersion)}`);
      logger.warn(`当前版本: ${chalk.yellow(currentVersion)}`);
      logger.warn(`更新命令: ${chalk.cyan(`npm install -g ${pkg.name}`)}`);
      logger.warn("-------------------------");
      return true;
    }

    return false;
  } catch (error) {
    // 检查更新失败，不影响正常使用，只是静默处理
    // 在开发环境下可以打印错误信息，方便调试
    if (process.env.NODE_ENV === "development") {
      logger.error(`版本检查失败: ${error.message}`);
    }
    return false;
  }
}
