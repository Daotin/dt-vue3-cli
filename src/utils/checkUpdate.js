import axios from "axios";
import semver from "semver";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { logger } from "./index.js";
import chalk from "chalk";

/**
 * 获取版本信息
 * @returns {Promise<{currentVersion: string, latestVersion: string}>}
 */
export async function getVersionInfo() {
  try {
    // 获取package.json
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packagePath = path.join(dirname(dirname(__dirname)), "package.json");
    const packageInfo = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    // 当前版本
    const currentVersion = packageInfo.version;
    let latestVersion = currentVersion; // 默认值为当前版本

    try {
      // 获取npm上最新版本
      const { data } = await axios.get(
        `https://registry.npmjs.org/${packageInfo.name}`
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
    if (semver.lt(currentVersion, latestVersion)) {
      logger.warn("-------------------------");
      logger.warn(`发现新版本: ${chalk.green(latestVersion)}`);
      logger.warn(`当前版本: ${chalk.yellow(currentVersion)}`);
      logger.warn(`更新命令: ${chalk.cyan("npm install -g dt-vue3-cli")}`);
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

console.log(await getVersionInfo(), await checkUpdate());
