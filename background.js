/**
 * MoeKoe 示例插件 - 后台脚本（Service Worker）
 *
 * 这个文件主要演示三件事：
 * 1. 插件安装时写入默认配置
 * 2. 作为消息中枢，处理 popup/content 的请求
 * 3. 在后台维护一个“最近一次页面上报状态”
 */

const STORAGE_KEY = "helperDemoSettings";

const DEFAULT_SETTINGS = {
  enabled: true,
  badgeText: "示例插件已生效"
};

// 保存内容脚本上报的最新页面信息（仅内存态，重启后清空）
let latestPageState = {
  title: "",
  url: "",
  hasAppRoot: false,
  updatedAt: 0
};

chrome.runtime.onInstalled.addListener(async () => {
  const saved = await getStorage(STORAGE_KEY);
  const normalized = normalizeSettings(saved[STORAGE_KEY]);

  // 合并默认值，避免未来新增字段时老配置缺失
  await setStorage({
    [STORAGE_KEY]: { ...DEFAULT_SETTINGS, ...normalized }
  });

  console.log("[helper-demo] 插件安装完成，默认配置已初始化");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    sendResponse({ ok: false, message: "无效消息" });
    return;
  }

  switch (message.type) {
    case "helper-demo:get-state":
      handleGetState(sendResponse);
      return true;

    case "helper-demo:save-settings":
      handleSaveSettings(message.payload, sendResponse);
      return true;

    case "helper-demo:reset-settings":
      handleResetSettings(sendResponse);
      return true;

    case "helper-demo:report-page":
      handleReportPage(message.payload, sender, sendResponse);
      return true;

    default:
      sendResponse({ ok: false, message: "未知消息类型" });
  }
});

async function handleGetState(sendResponse) {
  try {
    const saved = await getStorage(STORAGE_KEY);
    const settings = normalizeSettings(saved[STORAGE_KEY]);

    sendResponse({
      ok: true,
      data: {
        settings,
        latestPageState
      }
    });
  } catch (error) {
    sendResponse({
      ok: false,
      message: `读取状态失败: ${error.message}`
    });
  }
}

async function handleSaveSettings(payload, sendResponse) {
  try {
    const settings = normalizeSettings(payload);
    await setStorage({ [STORAGE_KEY]: settings });

    sendResponse({
      ok: true,
      data: settings
    });
  } catch (error) {
    sendResponse({
      ok: false,
      message: `保存配置失败: ${error.message}`
    });
  }
}

async function handleResetSettings(sendResponse) {
  try {
    await setStorage({ [STORAGE_KEY]: { ...DEFAULT_SETTINGS } });
    sendResponse({
      ok: true,
      data: { ...DEFAULT_SETTINGS }
    });
  } catch (error) {
    sendResponse({
      ok: false,
      message: `恢复默认失败: ${error.message}`
    });
  }
}

function handleReportPage(payload, sender, sendResponse) {
  const pageState = payload && typeof payload === "object" ? payload : {};

  latestPageState = {
    title: String(pageState.title || ""),
    url: String(pageState.url || ""),
    hasAppRoot: Boolean(pageState.hasAppRoot),
    updatedAt: Date.now(),
    tabId: typeof sender?.tab?.id === "number" ? sender.tab.id : null
  };

  sendResponse({ ok: true });
}

function normalizeSettings(raw) {
  const next = raw && typeof raw === "object" ? raw : {};
  return {
    enabled: typeof next.enabled === "boolean" ? next.enabled : DEFAULT_SETTINGS.enabled,
    badgeText: typeof next.badgeText === "string" && next.badgeText.trim()
      ? next.badgeText.trim()
      : DEFAULT_SETTINGS.badgeText
  };
}

function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result || {}));
  });
}

function setStorage(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => resolve());
  });
}
