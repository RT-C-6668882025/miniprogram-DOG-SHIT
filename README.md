# 荒谬论文生成与分区系统

> Nature Absurdity Edition — 基于 AI 的学术娱乐系统

一个模仿 Nature 顶刊结构与评价体系的"荒谬论文生成与分区系统"。通过严肃学术结构包装极端无意义、猎奇、反人类逻辑的研究内容，并对其进行严肃评分与分区。

**唯一目标：娱乐。**

---

## 功能概览

### 🎓 论文生成系统
- 支持自定义研究主题或点击「随机极端选题」
- 可选荒谬等级：L1（轻度离谱）、L2（严重离谱）、L3（宇宙级荒谬）
- 覆盖物理、生物、心理、社会学、医学（虚构）、交叉学科等领域
- 输出完整学术结构：Title、Abstract、Introduction、Methods、Results、Discussion、Conclusion、References、DOI 等
- 流式打字机效果实时展示生成过程
- 严格内容约束：被动语态、必须包含样本量/p 值、禁止网络语气、不涉及真实人物或机构

### 📊 荒谬学术指数（AIF）
- 总分 100 分，多维度加权评估
- AI 二次评估 + 规则关键词触发混合评分
- 动态影响因子与被引频次模拟

### 🏆 排行榜系统
- 本周荒谬一区榜、猎奇指数榜、反人类逻辑榜、统计滥用榜
- 展示标题、AIF 分数、分区等级、DOI、虚构引用次数
- 支持点赞互动

### 📄 PDF 导出
- 仿 Nature 双栏排版（CSS Grid + 多列布局）
- 三页结构：论文正文 → AIF 评分表 → 分区认证页

### 🗣️ Reviewer 系统
- 自动生成 Reviewer 1 意见与 Reviewer 2 刻薄意见
- 模拟编辑决定，保持严肃学术语气

### 📤 分享系统
- 学术风格分享卡片（标题 + 分区 + AIF + 摘要 + DOI）
- 朋友圈长图海报（Canvas 2D 高分辨率渲染 + Retina 适配 + 内存降级）
- 微信好友直接转发 PDF

---

## 技术架构

### 前端
| 技术 | 说明 |
|------|------|
| 微信小程序原生 | WXML + WXSS + TypeScript |
| 云开发 SDK | CloudBase Serverless |
| WebGL | 开场 3D 粒子动画（3000 粒子 + 自定义着色器） |
| Canvas 2D | 海报渲染（Retina 适配 + 动态降级） |
| markdown-it + mp-html | Markdown 渲染与代码高亮 |
| CSS Grid / Multi-column | 仿学术期刊双栏排版 |

### 后端
| 模块 | 技术 |
|------|------|
| 运行环境 | 微信云开发（CloudBase） |
| AI 模型 | DeepSeek API（流式 SSE 输出） |
| PDF 生成 | Node.js + Puppeteer 无头浏览器 |
| 数据库 | 云开发 NoSQL 文档数据库 |
| 内容安全 | 云开发内容安全 API |

### 云函数

| 函数 | 说明 |
|------|------|
| `paperGenerator` | 调用 DeepSeek 生成荒谬论文 + AIF 评分 |
| `pdfGenerator` | 服务端 Puppeteer PDF 排版与合成 |
| `getUserOpenId` | 用户身份鉴权（获取 OpenID） |
| `verifyAdmin` | 管理员身份验证 |
| `initDatabase` | 数据库初始化 |
| `admin` | 管理员相关云函数 |

### 内容安全系统

| 层级 | 模块 | 说明 |
|------|------|------|
| 第一层 | `inputFilter.js` | 前置输入过滤（长度校验、零宽字符清除、emoji 清除、偏旁/谐音检测、风险评分 0-100） |
| 第二层 | `sensitiveWordFilter.js` | DFA 算法敏感词检测 + 安全策略词库合并 + 审计日志 |
| 第三层 | `contentAuditor.js` | 内容审核中间件（整合输入过滤 + 敏感词 + 安全策略，区分荒谬与低俗） |
| 策略层 | `contentSafetyPolicy.js` | 6 类零容忍分类、5 级审核等级、申诉机制 |
| 工作流 | `paperWorkflow.js` | 六层论文生成：输入→模板→生成→输出检测→自动修正→最终输出 |

---

## 项目结构

```
xcx/
├── miniprogram/                    # 小程序前端
│   ├── app.js                      # 入口（云开发初始化）
│   ├── app.json                    # 全局配置（页面路由、窗口样式）
│   ├── app.wxss                    # 全局样式（含 button-system、icon-font 引入）
│   ├── config/
│   │   └── contentSafetyPolicy.js  # 内容安全策略（零容忍分类、审核等级、申诉机制）
│   ├── utils/
│   │   ├── adminManager.js         # 管理员管理（固定ID、OpenID鉴权、敏感词管理、操作日志）
│   │   ├── adminAccess.js          # 管理员访问控制（旧版，已由 adminManager 替代）
│   │   ├── configManager.js        # 配置管理器
│   │   ├── contentAuditor.js       # 内容审核中间件（输入过滤 + 敏感词 + 安全策略）
│   │   ├── inputFilter.js          # 前置输入过滤（长度校验、字符清洗、偏旁/谐音检测、风险评分）
│   │   ├── paperWorkflow.js        # 论文生成六层工作流（输入→模板→生成→检测→修正→输出）
│   │   ├── pdfGenerator.js         # PDF 生成（仿 Nature 双栏 HTML 模板渲染）
│   │   ├── sensitiveWordFilter.js  # 敏感词过滤（DFA 算法 + 安全策略集成 + 审计日志）
│   │   ├── iconManager.js          # 图标资源管理器
│   │   └── util.ts                 # 工具函数（时间格式化）
│   ├── styles/
│   │   ├── button-system.wxss      # 统一按钮样式系统（iOS 风格、涟漪效果）
│   │   └── icon-font.wxss          # 图标字体 CSS（28 个图标类）
│   ├── assets/
│   │   └── icons/
│   │       └── icons.csv           # 图标定义表（29 个图标）
│   ├── pages/
│   │   ├── index/                  # 首页（功能导航、精选展示）
│   │   ├── paper/                  # 论文生成（Agent-UI 对话 + 工作流集成）
│   │   ├── ranking/                # 排行榜（周榜、猎奇榜、反逻辑榜）
│   │   ├── detail/                 # 论文详情（评分可视化、审稿意见、PDF 导出）
│   │   ├── profile/                # 个人中心
│   │   ├── settings/               # 设置
│   │   ├── admin/                  # 后台管理（敏感词、评分、违规、日志）
│   │   │   └── components/         # 管理子组件（score-manager、violation-manager）
│   │   ├── pdf-preview/            # PDF 预览（rich-text 渲染）
│   │   ├── splash/                 # 启动动画（Material Design 风格 + 粒子）
│   │   ├── intro/                  # 开场动画（WebGL 3D 粒子系统）
│   │   └── logs/                   # 日志
│   ├── components/
│   │   ├── agent-ui/               # AI 对话组件（腾讯云 Agent-UI）
│   │   │   ├── index.*             # 主组件（聊天、流式渲染、语音输入、联网搜索）
│   │   │   ├── chatFile/           # 文件上传（微信文件、图片、相机）
│   │   │   ├── collapse/           # 折叠卡片（推理过程、搜索结果）
│   │   │   ├── customCard/         # 自定义卡片（工具调用结果展示）
│   │   │   ├── feedback/           # 点赞/点踩反馈
│   │   │   ├── tool/               # 工具调用状态展示
│   │   │   ├── wd-markdown/        # Markdown 渲染（markdown-it + mp-html + highlight.js）
│   │   │   └── imgs/               # UI 图标资源（50+ SVG）
│   │   └── poster/                 # 海报生成组件
│   └── sitemap.json                # 小程序索引配置
├── cloudfunctions/                  # 云函数
│   ├── paperGenerator/             # 论文生成 + AIF 评分（DeepSeek API）
│   ├── pdfGenerator/               # PDF 生成（Puppeteer 双栏排版）
│   ├── getUserOpenId/              # 用户鉴权（OpenID 获取）
│   ├── verifyAdmin/                # 管理员身份验证
│   ├── initDatabase/               # 数据库初始化
│   └── admin/                      # 管理员云函数
│       └── config/database.js      # 数据库配置
├── docs/
│   └── database-design.md          # 数据库设计文档
├── typings/                        # TypeScript 类型定义
│   └── types/wx/                   # 微信小程序 API 类型声明
├── .gitignore                      # Git 忽略规则
├── DISCLAIMER.md                   # 免责声明
├── README.md                       # 项目说明文档
├── package.json                    # 项目依赖
├── tsconfig.json                   # TypeScript 配置（strict 模式）
├── project.config.json             # 微信开发者工具配置
└── 需求文档.txt                    # PRD + 系统架构设计文档
```

---

## 快速开始

### 环境要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 最新稳定版
- Node.js >= 14
- 微信小程序 AppID

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd xcx
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 导入微信开发者工具

1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录选择 `xcx` 根目录
4. AppID 替换为自己的（修改 `project.config.json` 中的 `appid` 字段）

#### 4. 配置云开发环境

1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/tcb) 创建云开发环境
2. 记录环境 ID（格式：`cloud-xxx`）
3. 在云开发控制台开通 AI 服务，配置 DeepSeek 模型
4. 编辑 `miniprogram/pages/paper/paper.js` 中的 `envId`

#### 5. 创建数据库集合

在云开发控制台创建以下集合：

| 集合名 | 说明 |
|--------|------|
| `papers` | 论文元数据（标题、摘要、AIF 分数、分区、DOI、CDN 链接） |
| `rankings` | 排行数据 |
| `thresholds` | 分区阈值（聚合流水线预计算） |

#### 6. 部署云函数

在微信开发者工具中：

1. 右键 `cloudfunctions/paperGenerator` → 上传并部署：云端安装依赖
2. 右键 `cloudfunctions/pdfGenerator` → 上传并部署：云端安装依赖
3. 右键 `cloudfunctions/getUserOpenId` → 上传并部署：云端安装依赖

#### 7. 编译运行

点击「编译」按钮，在模拟器中预览效果。

---

## 配色方案

| 变量 | 值 | 用途 |
|------|-----|------|
| `--academic-blue` | `#1e3a5f` | 学术蓝（主色） |
| `--academic-blue-light` | `#2d5a87` | 浅学术蓝 |
| `--academic-grey` | `#6b7280` | 学术灰 |
| `--academic-bg` | `#f9fafb` | 浅灰背景 |
| `--academic-border` | `#d1d5db` | 边框色 |

---

## AIF 评分体系

### 评分维度

| 维度 | 权重 | 说明 |
|------|------|------|
| 无意义指数 | 20% | 与实际意义的距离 |
| 猎奇度 | 15% | 话题新奇程度 |
| 反人类逻辑指数 | 15% | 逻辑荒谬程度 |
| 严肃外壳强度 | 15% | 学术格式完整度 |
| 统计滥用指数 | 10% | 统计数据滥用程度 |
| 逻辑自洽度 | 10% | 内部逻辑一致性 |
| 情感冷漠度 | 10% | 语气客观程度 |
| 传播潜力 | 5% | 社交传播潜力 |

### 分区规则

| AIF 分数 | 分区等级 | 颜色标识 |
|----------|----------|----------|
| 90+ | SSS一区 | `#dc2626` |
| 80–89 | S一区 | `#ea580c` |
| 70–79 | A一区 | `#16a34a` |
| 60–69 | B区 | `#2563eb` |
| <60 | C区 | `#6b7280` |

---

## 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `pages/index` | 项目简介、功能入口导航、精选荒谬论文展示 |
| 论文生成 | `pages/paper` | Agent-UI 对话组件 + DeepSeek 流式生成 |
| 排行榜 | `pages/ranking` | 多维度榜单（一区榜、猎奇榜、反人类逻辑榜、统计滥用榜） |
| 论文详情 | `pages/detail` | 完整论文内容、AIF 评分可视化、审稿意见、PDF/分享功能 |
| 个人中心 | `pages/profile` | 用户生成历史 |
| 设置 | `pages/settings` | 应用设置 |
| 后台管理 | `pages/admin` | 违规论文删除、评分调整、排行榜管理、敏感词过滤 |
| PDF 预览 | `pages/pdf-preview` | 微信原生文档预览 |
| 启动动画 | `pages/splash` | Material Design 风格启动动画（渐变背景 + 波浪 + 粒子） |
| 开场动画 | `pages/intro` | WebGL 3D 粒子系统（3000 粒子 + 自定义顶点/片元着色器 + 三阶段动画） |

---

## Agent-UI 组件

集成腾讯云官方 AI 对话组件，已深度定制到项目中。

**主要能力**：
- 流式打字机效果（SSE）
- 联网搜索（搜索结果折叠展示）
- 推理过程展示（深度思考折叠卡片）
- 语音输入（按住说话 + 滑动取消）
- 文件上传（微信文件、相册、相机）
- 工具调用展示（调用状态 + 参数 + 结果）
- 点赞/点踩反馈
- 多轮对话管理（历史列表 + 新建对话）
- Markdown 渲染 + 代码高亮

**基础库要求**：≥ 3.7.7

---

## 合规说明

本系统严格遵守 AIGC 内容监管要求：

- ✅ 所有页面强制标注「AI 生成」显式标识
- ✅ PDF 与海报嵌入不可擦除文字水印
- ✅ 隐式数字溯源（PDF 元数据 + 图片频域盲水印）
- ✅ 用户输入前置内容安全审查（云开发内容安全 API）
- ✅ 生成结果二次违规校验
- ✅ 禁止生成涉及真实灾难、疾病群体、暴力、政治等敏感内容

---

## 常见问题

### Q: 如何获取 DeepSeek API？

本项目使用腾讯云 AI 服务，已集成 DeepSeek 模型，无需单独获取 API Key。在云开发控制台开通 AI 服务即可。

### Q: 云函数部署失败？

请确保：
1. 已创建云开发环境
2. 云函数 runtime 设置为 Nodejs16.13
3. 网络连接正常

### Q: Agent-UI 组件报错？

请检查：
1. 基础库版本 ≥ 3.7.7
2. `project.config.json` 中 `es6: true` 和 `enhance: true`
3. 已清除缓存并重新编译

### Q: PDF 生成超时？

仿 Nature 双栏 PDF 排版属于计算密集型任务。建议：
1. 将 PDF 微服务部署在独立服务器（非云函数）
2. 采用异步任务队列 + 轮询/WebSocket 回调模式
3. 参见 `需求文档.txt` 中的架构设计章节

---

## 开发计划

- [x] UI 风格重构（学术极简风）
- [x] Agent-UI 组件集成与定制
- [x] 论文生成页面
- [x] 排行榜页面
- [x] 论文详情页面
- [x] AIF 评分算法
- [x] PDF 生成服务
- [x] Canvas 海报组件
- [x] 开场动画（WebGL 粒子系统）
- [x] 数据库设计文档
- [ ] 独立 Node.js PDF 微服务（异步任务队列）
- [ ] 用户系统完善
- [ ] 分享链路完整测试
- [ ] V2.0：用户投稿对战、多人投票、荒谬学科分区
- [ ] V3.0：年度荒谬影响因子报告、荒谬引用网络图

---

## 关于作者

我是一名艺术专业的学生，不是计算机专业出身，也没有系统的编程背景。这个项目是我从零开始边学边做摸索出来的。

因此代码中不可避免地存在各种问题：

- 架构设计可能不够合理
- 部分功能存在已知或未知的 Bug
- 代码风格可能不够规范
- 安全性方面可能存在漏洞
- 性能优化空间还很大
- 有些功能是开发过程中加了又删、改了又改的，可能留有一些残留代码

如果你发现了问题，欢迎指出，我会尽力学习和改进。

## 项目状态

本项目于 2025 年完成开发，已完成内测，原计划上线微信小程序，后因其他原因未能上线。代码以开源形式发布，供学习参考。

---

## 免责声明

本项目仅供娱乐使用，所有生成内容均为 AI 虚构，不代表任何学术观点或客观事实。请勿将生成内容用于任何正式场合。

## 许可证

MIT License
