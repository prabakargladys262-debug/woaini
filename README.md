# 专注陪伴 PWA — GitHub Pages 部署指南

## 📁 项目文件结构
```
你的仓库/
├── index.html        ← 主页面（已整合 PWA）
├── manifest.json     ← PWA 配置清单
├── sw.js             ← Service Worker（后台计时 + 通知 + 离线缓存）
├── icons/
│   ├── icon-192x192.png
│   └── icon-512x512.png
└── README.md         ← 本文件
```

## 🚀 部署步骤（GitHub Pages）

### 1. 创建 GitHub 仓库
- 打开 https://github.com/new
- 仓库名建议：`focus-timer`（或任意名称）
- 设为 **Public**（GitHub Pages 免费版要求公开仓库）
- 点击 Create repository

### 2. 上传文件
- 点击 "uploading an existing file"
- 把以下文件 **全部拖进去**：
  - `index.html`
  - `manifest.json`
  - `sw.js`
  - `icons/` 文件夹（含两个 png）
- 点击 Commit changes

### 3. 开启 GitHub Pages
- 进入仓库 → Settings → Pages
- Source 选择 **Deploy from a branch**
- Branch 选择 `main`，文件夹选 `/ (root)`
- 点击 Save
- 等待 1-2 分钟，页面顶部会出现你的网址：
  `https://你的用户名.github.io/focus-timer/`

### 4. 手机添加到主屏幕

**iPhone (iOS 16.4+)**：
1. 用 Safari 打开你的 GitHub Pages 网址
2. 点击底部 **分享** 按钮（方框带箭头）
3. 滑动找到 **"添加到主屏幕"**
4. 点击添加 → 桌面出现 App 图标
5. 从主屏幕打开，**此时才能收到通知推送**

**安卓**：
1. 用 Chrome 打开你的 GitHub Pages 网址
2. Chrome 会自动弹出 **"添加到主屏幕"** 提示
3. 或点击右上角 ⋮ → 添加到主屏幕 / 安装应用
4. 首次打开时允许通知权限

## ✅ 功能验证清单

部署后逐项测试：

- [ ] 打开网页，浏览器询问通知权限 → **允许**
- [ ] 导入角色卡，世界书条目自动提取
- [ ] 开始专注计时，切到后台/锁屏
- [ ] 等计时结束 → 收到系统通知推送
- [ ] 横屏时界面左右并排显示
- [ ] 休息聊天室对话简短（1-3句）
- [ ] 导入 PNG/JPG/WebP 作为差分表情

## ⚠️ 注意事项

1. **iOS 必须用 Safari 添加到主屏幕**，从 Chrome/其他浏览器添加不支持通知
2. **iOS 16.4 以下版本不支持 PWA 通知**，请确保系统已更新
3. API Key 存储在 localStorage 中，仅在你自己的设备上，不会上传到服务器
4. 如果更新了代码，需要在手机上 **删除主屏幕图标后重新添加**，或在 Service Worker 中更新 CACHE_NAME 版本号

## 🔧 自定义图标

icons/ 文件夹里的是默认紫色圆形图标。你可以替换为自己喜欢的图片：
- `icon-192x192.png` — 192×192 像素
- `icon-512x512.png` — 512×512 像素
- 建议用 PNG 透明底，正方形
