# dt-vue3-cli

一个简单易用的 Vue3 项目脚手架工具，用于快速创建 Vue3 项目模板。

[![NPM Version](https://img.shields.io/npm/v/dt-vue3-cli.svg)](https://www.npmjs.com/package/dt-vue3-cli)
[![Node Version](https://img.shields.io/node/v/dt-vue3-cli.svg)](https://www.npmjs.com/package/dt-vue3-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 功能特点

- 🚀 快速创建 Vue3 项目模板
- 🔄 自动检查版本更新
- 📦 支持一键更新 CLI 到最新版本
- 🎨 美观的命令行界面
- 📝 详细的日志输出

## 安装

```bash
# 全局安装
npm install -g dt-vue3-cli

# 或者使用yarn
yarn global add dt-vue3-cli

# 或者使用pnpm
pnpm add -g dt-vue3-cli
```

## 使用方法

### 创建项目

```bash
# 创建一个新项目
dt-vue3-cli create <app-name>

# 覆盖已存在的目录
dt-vue3-cli create <app-name> --force
```

### 检查更新

```bash
# 检查CLI版本更新
dt-vue3-cli update-check
```

### 更新 CLI

```bash
# 更新CLI到最新版本
dt-vue3-cli update
```

### 帮助信息

```bash
# 查看帮助信息
dt-vue3-cli --help

# 查看版本号
dt-vue3-cli --version
```

## 开发与构建

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build

# 本地测试
npm link
```

## 参考资料

- [从零开始构建脚手架](https://daotin.github.io/fe-series-notes/engineer/vue3-cli/从零开始构建脚手架.html)

## 贡献指南

欢迎提交问题和功能请求。如果您想为代码做出贡献，请提交 PR。

## 许可证

[MIT](LICENSE)
