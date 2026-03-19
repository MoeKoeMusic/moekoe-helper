/**
 * MoeKoe 示例插件 - 内容脚本
 *
 * 本文件演示：
 * 1. 读取并应用插件配置
 * 2. 向页面注入一个简单 UI（右上角角标）
 * 3. 页面状态上报给后台脚本
 * 4. 监听存储变化并实时更新 UI
 */

(function () {
  "use strict";

  const STORAGE_KEY = "helperDemoSettings";
  const BADGE_ID = "moekoe-helper-demo-badge";

  const DEFAULT_SETTINGS = {
    enabled: true,
    badgeText: "示例插件已生效"
  };

  let settings = { ...DEFAULT_SETTINGS };

  init().catch((error) => {
    console.error("[helper-demo] 内容脚本初始化失败:", error);
  });

  async function init() {
    settings = await readSettings();
    applyBadge(settings);
    reportPageState();
    listenStorageChanges();
  }

  async function readSettings() {
    const data = await storageGet(STORAGE_KEY);
    const raw = data[STORAGE_KEY];
    return normalizeSettings(raw);
  }

  function applyBadge(nextSettings) {
    const current = nextSettings || settings;

    if (!current.enabled) {
      removeBadge();
      return;
    }

    const badge = ensureBadge();
    badge.textContent = `MoeKoe 示例: ${current.badgeText}`;
  }

  function ensureBadge() {
    let badge = document.getElementById(BADGE_ID);
    if (badge) return badge;

    badge = document.createElement("div");
    badge.id = BADGE_ID;
    badge.style.cssText = [
      "position: fixed",
      "top: 14px",
      "right: 14px",
      "z-index: 999999",
      "padding: 8px 12px",
      "border-radius: 999px",
      "background: rgba(30, 30, 30, 0.78)",
      "color: #fff",
      "font-size: 12px",
      "line-height: 1",
      "pointer-events: none",
      "backdrop-filter: blur(6px)",
      "box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28)"
    ].join(";") + ";";

    document.documentElement.appendChild(badge);
    return badge;
  }

  function removeBadge() {
    const badge = document.getElementById(BADGE_ID);
    if (badge) badge.remove();
  }

  function reportPageState() {
    const payload = {
      title: document.title || "",
      url: location.href,
      hasAppRoot: Boolean(document.getElementById("app"))
    };

    chrome.runtime.sendMessage({
      type: "helper-demo:report-page",
      payload
    });
  }

  function listenStorageChanges() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes[STORAGE_KEY]) return;

      settings = normalizeSettings(changes[STORAGE_KEY].newValue);
      applyBadge(settings);
    });
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

  function storageGet(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => resolve(result || {}));
    });
  }
})();
