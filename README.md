# MoeKoe Music Helper（示例插件模板）

这个项目是一个**教学型示例插件**，目标不是提供具体功能，而是演示 MoeKoe Music 插件开发中最常见的三件事：

- 配置存储（`chrome.storage.local`）
- 弹窗与后台通信（`chrome.runtime.sendMessage`）
- 内容脚本注入与页面状态上报

## 你可以从这个示例学到什么

1. `manifest.json` 如何规范声明字段
2. `background.js` 如何作为消息中枢
3. `content.js` 如何注入页面 UI 并响应配置变化
4. `popup.js` 如何读写配置并展示状态

## 目录结构

```text
moekoe-helper/
├─ manifest.json        # 插件清单（含 plugin_id、minversion 示例）
├─ background.js        # 后台脚本：默认配置、消息处理、状态保存
├─ content.js           # 内容脚本：注入示例角标、上报页面状态
├─ popup.html           # 弹窗页面（示例控制面板）
├─ popup.js             # 弹窗逻辑（读取状态、保存配置）
└─ icons/               # 插件图标
```

## 清单字段说明（重点）

- `plugin_id`：插件唯一业务 ID
- `version`：插件版本
- `minversion`：最低支持的 MoeKoe Music 主程序版本（示例：`1.6.0`）可空
- `moekoe`：标识为 MoeKoe Music 适配插件

## 安装方式

### 方式一：手动安装（本地开发常用）

1. 将插件目录放入 MoeKoe Music 插件目录 `plugins/extensions/`
2. 打开 MoeKoe Music 的插件管理页
3. 点击刷新插件，或重启主程序

### 方式二：自动安装（插件市场）

1. 把插件发布到 [插件市场源](https://github.com/MoeKoeMusic/MoeKoeMusic-Plugins)
2. 在 MoeKoe Music 插件管理中进入“插件市场”
3. 点击安装，程序会自动下载并安装 zip 包

## 运行后你会看到什么

- 页面右上角出现示例角标（可在弹窗中开关）
- 弹窗中可修改角标文案并保存
- 弹窗中可看到内容脚本上报的页面标题、URL、更新时间

## 二次开发建议

1. 在 `content.js` 中把“示例角标”替换成你的真实页面功能
2. 在 `background.js` 中接入你自己的 API 逻辑（翻译、识别、同步等）
3. 在 `popup.js` 中新增设置项，并统一走消息与存储
4. 保持注释清晰：每个模块只做一类职责

## 注意事项

- 这是示例模板，默认功能简单，便于你快速改造
- 如果你新增权限，请同步更新 `manifest.json`
- 如果插件需要特定主程序能力，请提高 `minversion`
- 某些插件可能会对页面进行注入，需刷新页面才能生效
