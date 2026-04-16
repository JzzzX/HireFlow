# HireFlow README Refresh Design

## Goal

把仓库首页从工程备忘录改成更像真实产品的介绍页，同时保留开发者启动、配置和部署信息。

## Audience

- 第一受众：招聘方、面试官、产品评审
- 第二受众：想要本地运行或二次开发的开发者

## Decisions

1. 品牌统一使用 `HireFlow`
   - 仓库名保持 `hiring_assist`
   - README 内统一把产品名写成 `HireFlow`

2. README 采用产品型结构
   - 顶部品牌介绍
   - 演示入口
   - 产品价值与核心能力
   - 候选人申请路径
   - 技术栈与本地开发
   - 环境变量与部署说明

3. 演示视频采用“封面图 + 视频链接”
   - 原始录屏为 `274MB`，不适合直接作为 GitHub 首页附件
   - 生成仓库内压缩版 `mp4`
   - 首页展示封面图，点击进入视频文件

## Asset Strategy

- `docs/assets/hireflow-demo-cover.jpg`
  - 用于 README 首页可点击封面
- `docs/assets/hireflow-demo.mp4`
  - 用于 README 演示链接

## Success Criteria

- README 首屏能在 GitHub 上快速说明产品定位
- 演示入口直观可见
- 技术信息仍然完整，但不再主导首页叙事
- 资源路径使用仓库相对路径，克隆后即可访问
