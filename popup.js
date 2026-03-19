/**
 * MoeKoe 示例插件 - 弹窗脚本
 *
 * 这里演示：
 * 1. 向后台请求当前状态
 * 2. 在弹窗编辑配置并保存
 * 3. 在弹窗内展示内容脚本上报的页面信息
 */

const DEFAULT_SETTINGS = {
  enabled: true,
  badgeText: "示例插件已生效"
};

const enabledCheckbox = document.getElementById("enabledCheckbox");
const badgeTextInput = document.getElementById("badgeTextInput");
const pageInfo = document.getElementById("pageInfo");
const saveButton = document.getElementById("saveButton");
const resetButton = document.getElementById("resetButton");
const statusText = document.getElementById("statusText");

let currentSettings = { ...DEFAULT_SETTINGS };

init().catch((error) => {
  setStatus(`初始化失败: ${error.message}`, "error");
});

async function init() {
  bindEvents();
  await refreshState();
}

function bindEvents() {
  saveButton.addEventListener("click", saveSettings);
  resetButton.addEventListener("click", resetSettings);
}

async function refreshState() {
  const response = await sendMessage({ type: "helper-demo:get-state" });
  if (!response?.ok) {
    setStatus(response?.message || "读取状态失败", "error");
    return;
  }

  currentSettings = normalizeSettings(response.data?.settings);
  renderSettings();
  renderPageState(response.data?.latestPageState || {});
  setStatus("状态已同步", "success");
}

function renderSettings() {
  enabledCheckbox.checked = currentSettings.enabled;
  badgeTextInput.value = currentSettings.badgeText;
}

function renderPageState(state) {
  const title = state.title || "-";
  const url = state.url || "-";
  const hasAppRoot = state.hasAppRoot ? "是" : "否";
  const updatedAt = state.updatedAt
    ? new Date(state.updatedAt).toLocaleString()
    : "-";

  pageInfo.innerHTML = [
    `<div><strong>标题：</strong>${escapeHtml(title)}</div>`,
    `<div><strong>URL：</strong>${escapeHtml(url)}</div>`,
    `<div><strong>检测到 #app：</strong>${hasAppRoot}</div>`,
    `<div><strong>更新时间：</strong>${escapeHtml(updatedAt)}</div>`
  ].join("");
}

async function saveSettings() {
  const next = normalizeSettings({
    enabled: enabledCheckbox.checked,
    badgeText: badgeTextInput.value
  });

  const response = await sendMessage({
    type: "helper-demo:save-settings",
    payload: next
  });

  if (!response?.ok) {
    setStatus(response?.message || "保存失败", "error");
    return;
  }

  currentSettings = normalizeSettings(response.data);
  renderSettings();
  setStatus("保存成功", "success");
}

async function resetSettings() {
  const response = await sendMessage({ type: "helper-demo:reset-settings" });
  if (!response?.ok) {
    setStatus(response?.message || "恢复默认失败", "error");
    return;
  }

  currentSettings = normalizeSettings(response.data);
  renderSettings();
  setStatus("已恢复默认配置", "success");
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

function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          message: chrome.runtime.lastError.message
        });
        return;
      }
      resolve(response || { ok: false, message: "无响应" });
    });
  });
}

function setStatus(message, type = "") {
  statusText.textContent = message;
  statusText.className = `status ${type}`.trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
