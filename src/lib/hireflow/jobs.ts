import type { Job, JobCategoryFilter, JobSection } from "@/lib/hireflow/types";

type JobSeed = {
  id: string;
  title: string;
  category: Exclude<JobCategoryFilter, "All">;
  locationLabel: string;
  applyEmail: string;
  sourceUrl: string;
  sections: JobSection[];
};

export const JOB_CATEGORIES: JobCategoryFilter[] = ["All", "实习", "技术", "产品/设计", "运营/市场", "职能"];
export const JOBS_LAST_UPDATED = "2026 年 3 月 17 日";

const LOCATION = "上海市杨浦区创智天地";
const DEFAULT_UPDATED_AT = "2026-03-17";
const APPLY_EMAIL_OVERRIDE = process.env.NEXT_PUBLIC_APPLY_EMAIL_OVERRIDE?.trim() || null;

function inferTeam(title: string) {
  if (title.startsWith("小宇宙")) {
    return "小宇宙";
  }
  if (title.startsWith("AI")) {
    return "AI";
  }
  return "即刻";
}

function inferLevel(category: JobSeed["category"]): Job["level"] {
  return category === "实习" ? "INTERN" : "FULL-TIME";
}

const jobSeeds: JobSeed[] = [
  {
    id: "xiaoyuzhou-content-operations-intern",
    title: "小宇宙内容运营实习生",
    category: "实习",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/intern-operation-1",
    sections: [
      {
        title: "职位描述",
        items: [
          "参与站内播客内容的筛选、整理与日常推荐，挖掘有潜力的优质节目与单集。",
          "协同主播运营团队，对主播节目进行内容诊断与效果反馈，帮助创作者优化选题与制作。",
          "参与跨部门协作项目，负责核心内容的策划、执行与文案输出，协助推进项目落地。",
          "跟进内容表现，做好日常数据记录与阶段性复盘。",
        ],
      },
      {
        title: "职位要求",
        items: [
          "大三及以上在校生，每周到岗 4 天以上，实习期半年以上。",
          "热爱听播客，收听品类广泛，对播客内容与创作有自己的理解和审美标准。",
          "具备优秀的文案撰写能力，能快速抓取复杂内容的重点，输出有传播力的文字。",
          "有良好的整理归纳习惯，熟练使用 Excel 等基础工具，能做好日常数据的记录与追踪，并能从中发现问题。",
          "沟通顺畅，执行力强。在跨部门协作时，能清晰表达诉求，灵活推进项目，有良好的团队协作精神。",
          "熟悉当下流行文化与社交媒体趋势，对不同圈层的表达偏好与用户心理有基本感知。",
        ],
      },
      {
        title: "加分项",
        items: ["有互联网公司内容运营、新媒体运营或市场策划相关实习经验。", "熟悉 Word、Excel、AI 工具，善用工具提升产出效率。"],
      },
      {
        title: "投递须知",
        items: ["请发送简历到 hr@iftech.io，标题中注明「应聘职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的资料。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-product-intern",
    title: "小宇宙产品实习生",
    category: "实习",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/intern-xiaoyuzhou-pmshixisheng%202",
    sections: [
      {
        title: "职位描述",
        items: [
          "协助建设小宇宙商业化产品体系，参与需求分析、竞品调研、版本规划、功能设计、项目跟进的全流程产品工作。",
          "协助参与商业化项目推进过程中的跨部门协调沟通，将业务需求转化落地为可持续的产品方案。",
          "协助参与其他小宇宙业务相关功能迭代的产品工作。",
          "统计分析行业产品动向，跟踪数据指标和用户反馈，协助提出产品策略建议。",
        ],
      },
      {
        title: "职位要求",
        items: [
          "26 届本科及以上学校在读，可实习 6 个月以上优先。",
          "了解产品经理的职责，具有良好的逻辑思维能力、业务理解能力和快速学习能力。",
          "善于沟通，有同理心，工作积极主动，具备良好的团队协作能力与承压能力。",
        ],
      },
      {
        title: "加分项",
        items: ["小宇宙 App 深度用户。", "播客爱好者 / 内容创作者。", "有相关岗位的实习经验。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "ai-product-assistant-intern",
    title: "AI 产品助理实习生",
    category: "实习",
    locationLabel: LOCATION,
    applyEmail: "lijianmin@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/intern-AI-pm%203",
    sections: [
      {
        title: "职位描述",
        items: ["根据业务需求，结合最新的 AI 文字与音视频技术做技术验证和打样。"],
      },
      {
        title: "职位要求",
        items: ["计算机相关专业 26 届及以上在校生。", "对 AI 相关方向有浓厚兴趣和应用能力。", "必须具有基础代码能力，可以探索实现基础功能。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 lijianmin@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-commercial-operations-intern",
    title: "小宇宙商业化项目运营实习生",
    category: "实习",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/intern-operation-MKT%207",
    sections: [
      {
        title: "职位描述",
        items: [
          "支持小宇宙 ToB 商业化业务全流程，包括方案策划与项目落地执行。",
          "针对品牌商务合作可能性，与销售与商业策划团队协同，输出基于平台资源与内容生态的营销方案。",
          "协助商业合作项目的全流程管理，促进项目顺利推进及落地，并完成进度管理、资源调配、沟通答疑、风险管控、数据整理、结案报告制作等事项。",
          "定期整合站内优质商业化项目，协助更新平台 credential，为商业化团队拓展业务积累有效案例经验。",
        ],
      },
      {
        title: "职位要求",
        items: [
          "对播客内容生态有一定了解，对社会热点、网络传播事件等具备敏锐感知。",
          "具有良好的逻辑思辨能力，能够输出个人观点洞察。",
          "具有良好的沟通能力、时间管理能力与团队协作能力。",
          "27 届本科及以上学校在读，可实习 6 个月以上优先。",
        ],
      },
      {
        title: "加分项",
        items: ["小宇宙 App 深度用户。", "有互联网平台商业化中心、4A 广告公司、创意热店等对客或策略类实习经验优先。", "乐于学习新事物，能够适应 multi-tasking 的工作模式。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-algorithm-intern",
    title: "小宇宙算法实习生",
    category: "实习",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/intern-xiaoyuzhou-AE",
    sections: [
      {
        title: "职位描述",
        items: [
          "协助推荐、搜索系统的数据分析和算法及策略调研工作。",
          "参与推荐模型相关的数据清洗和特征工程。",
          "配合团队完成模型和策略的实验和效果评估。",
          "学习和了解小宇宙业务中的 AI 应用场景。",
        ],
      },
      {
        title: "职位要求",
        items: [
          "26 届及以上计算机、数学、统计学等相关专业在读学生，可实习 6 个月以上优先。",
          "对机器学习、深度学习有基本了解和浓厚兴趣。",
          "熟练掌握 Python / Golang 编程，了解基础的大数据技能。",
          "具备基础的数据分析和统计学知识。",
          "学习能力强，责任心强，能够承担一定工作压力。",
        ],
      },
      {
        title: "加分项",
        items: ["有机器学习相关项目经验或竞赛经历。", "了解深度学习框架如 TensorFlow、PyTorch 等。", "对推荐系统、搜索引擎有一定了解。", "对音频处理领域有兴趣。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-creator-operations-intern",
    title: "小宇宙创作者运营实习生",
    category: "实习",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/intern-xiaoyuzhou-yy%202",
    sections: [
      {
        title: "职位描述",
        items: ["负责 KOL 引入工作，包括邀请、入驻沟通、数据复盘。", "负责部分垂类扶持运营工作。", "支持付费结算、传播数据整理等工作。"],
      },
      {
        title: "职位要求",
        items: ["大三 / 研一在校生，每周到岗 5 天，实习期半年以上。", "逻辑清晰、擅长表格与复盘。", "长期主义，热爱集体，协作无障碍。", "熟悉互联网生态，网上冲浪达人。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "sre-engineer",
    title: "SRE工程师",
    category: "技术",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-technology-sre",
    sections: [
      {
        title: "职位描述",
        items: ["负责公司内部基础设施平台的维护和优化，保障生产环境的稳定运行。", "协助业务团队解决生产环境中的技术难题，提出改进方案。", "探索 AI 技术下的基础设施诊断方案，提升运维效率。"],
      },
      {
        title: "职位要求",
        items: [
          "熟悉至少一个公有云平台，如阿里云、腾讯云、AWS 等。",
          "熟悉至少一种编程语言，如 Python、Node.js、Go 等。",
          "熟悉至少一种数据库的使用和维护，如 MySQL、PostgreSQL、MongoDB 等。",
          "熟悉 Kubernetes、Operator、Docker、CI/CD 等容器化技术。",
          "可以兼顾 oncall 与系统、工具开发，需要对 debug 难题有耐心，也需要有工程能力设计和实现解决方案。",
        ],
      },
      {
        title: "加分项",
        items: ["参与过开源项目。", "有前端开发经验。", "对 AI 感兴趣。"],
      },
      {
        title: "投递须知",
        items: ["请发送简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻 / 小宇宙用户名、GitHub 或其他可以让我们更多了解你的资料。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-ios-engineer",
    title: "小宇宙iOS开发工程师",
    category: "技术",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-technology-ios%202",
    sections: [
      {
        title: "职位描述",
        items: ["负责公司旗下产品 iOS 端开发、维护、发布相关工作。", "负责内部基础设施的维护。", "参与产品开发周期中各个阶段，配合相关同事工作。", "合理技术选型，挑战现有架构，融合其他技术栈的优秀实践。", "理性沟通，持续学习，同时帮助同事快速成长。"],
      },
      {
        title: "职位要求",
        items: ["4 年以上 iOS 开发经验，至少 2 年 Swift 开发经验。", "掌握 UIKit。", "掌握代码版本管理工具 Git。", "熟悉 Swift Concurrency 的使用和写法。", "熟悉 Combine 或 RxSwift 的使用，对响应式编程有了解。", "熟悉 iOS 下网络通信机制，对 Socket 通信有一定了解。", "熟悉 Crash 异常分析、常用监控工具与 Instruments。", "熟悉 CI/CD，熟悉 fastlane 工具。"],
      },
      {
        title: "加分项",
        items: ["有上架一款应用，熟悉 HIG 条款。", "有音视频相关技术经验。", "热衷学习新技术，对 Swift 更新有热情。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-frontend-engineer",
    title: "小宇宙前端开发工程师",
    category: "技术",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-technology-fe",
    sections: [
      {
        title: "职位描述",
        items: ["参与小宇宙前端产品开发及功能迭代。", "参与前端基础设施的建设与维护，与团队成员紧密配合，推动功能、优化或重构的落地。"],
      },
      {
        title: "职位要求",
        items: ["计算机或相关专业毕业，1 年以上前端开发工作经验。", "熟练掌握 Git、HTML、JavaScript、TypeScript、CSS 等基础知识。", "熟悉 React 或精通其他主流前端框架及相关技术栈，并有实际项目研发经验。", "具备较强的分析和解决问题能力，以及良好的沟通能力。", "有良好的编程习惯，对代码交付质量有追求，有持续优化、勇于重构和积极探究的热情。", "有从 0 到 1 的前端工程实施经验，能主动优化策略、规避风险并总结经验。"],
      },
      {
        title: "加分项",
        items: ["在 2D / 3D / 动画图形技术、音频处理、WebAssembly、Service Worker、低代码、微前端、跨平台或小程序开发等方向有独到理解或成果。", "有一定的全栈开发能力，能够开发或维护简单服务端逻辑。", "有关注或参与的开源项目。", "有独立负责中型前端 Web 项目的相关经验。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "ai-plugin-fullstack-engineer",
    title: "AI插件全栈工程师（偏前端）",
    category: "技术",
    locationLabel: LOCATION,
    applyEmail: "lijianmin@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-technology-fe%202",
    sections: [
      {
        title: "职位描述",
        items: ["负责 Chrome 插件和网页的业务前端开发及优化迭代。"],
      },
      {
        title: "职位要求",
        items: ["计算机或相关专业毕业，2 年以上前端开发工作经验。", "熟练掌握 HTML、JS / TS、CSS 等基础知识。", "掌握 React 及相关技术栈，并有实际项目研发经验。", "具备较强的分析和解决问题能力，以及良好的沟通能力。", "有良好的编程习惯，对代码交付质量有追求，有持续优化、勇于重构和积极探究的热情。", "有从 0 到 1 的前端工程实施经验，有从技术侧主动优化策略、规避风险、发现和解决问题、总结经验的意识。", "对前端技术有持续的学习热情。"],
      },
      {
        title: "加分项",
        items: ["具有开源精神，关注、参与过开源项目。", "了解大语言模型应用开发，尝试过 Prompt 编写和模型调用，有独立完成 AI 小项目更好。", "具有全栈技术知识储备。", "具有大局观，能够从全局角度出发积极提出建议或想法。", "足够理性，且兼具共情力。", "具有良好的产品品味，热爱观察、思考各类产品，对产品有自己的见解。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 lijianmin@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "ai-backend-engineer",
    title: "AI工具后端工程师",
    category: "技术",
    locationLabel: LOCATION,
    applyEmail: "lijianmin@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-technology-be%204",
    sections: [
      {
        title: "职位描述",
        items: ["为 Web / 移动客户端应用制定和开发接口。", "根据业务设计后端技术架构并实现。", "为后端业务接入数据打点 / 监控体系。"],
      },
      {
        title: "职位要求",
        items: ["2 年以上后端研发经验。", "熟练掌握 Node.js / TypeScript 技术栈。", "熟练掌握至少一种关系型数据库的使用和 SQL 调优。", "对业务数据打点和分析有一定了解。", "了解大语言模型应用开发，尝试过 Prompt 编写和模型调用。"],
      },
      {
        title: "加分项",
        items: ["自己做过 AI 项目，对大模型调用、AI workflow 有一定的项目经验。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 lijianmin@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-algorithm-engineer",
    title: "小宇宙算法工程师",
    category: "技术",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-technology-algorithm%201",
    sections: [
      {
        title: "职位描述",
        items: ["参与小宇宙推荐、搜索系统的研发和优化工作。", "协助推荐模型、内容理解相关算法的实现和调优。", "配合产品、运营等团队进行数据分析和画像构建。", "参与小宇宙业务相关的 AI 场景产品开发。"],
      },
      {
        title: "职位要求",
        items: ["计算机相关专业毕业，3 年以内推荐 / 搜索 / 机器学习等相关经验。", "了解推荐系统或搜索系统的基本原理和实现，对 NLP / 大模型熟悉。", "有一定的数据处理经验，了解常用的数据工具。", "熟练掌握至少一门编程语言，如 Python / Java / Go 等。", "良好的学习能力和沟通能力，具备团队合作精神。"],
      },
      {
        title: "加分项",
        items: ["对机器学习、深度学习算法有一定了解。", "有实际项目经验或相关实习经历。", "了解音频处理或相关领域算法。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-commercialization-product-manager",
    title: "产品经理（小宇宙商业化方向）",
    category: "产品/设计",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-%20product-pm%208",
    sections: [
      {
        title: "职位描述",
        items: ["负责商达撮合平台产品，包括入驻、撮合、订单、营销、数据、结算、客服等环节工具搭建。", "完善产品基础设施搭建，并基于产品和业务现状挖掘用户需求、识别产品瓶颈，推动产品能力完善和玩法创新。", "协同运营、销售、技术团队，落地产品方案。"],
      },
      {
        title: "职位要求",
        items: ["本科及以上学历，3 年以上营销产品工作经验，熟悉主流商达撮合平台和互联网广告平台系统和模式。", "对商业广告和营销产品兴趣浓厚，有客户视角和丰富行业知识，理解 B 端客户需求和达人创作者需求。", "具备较强的业务抽象、系统设计与项目管理能力，能平衡业务诉求和长期产品发展的需要。", "对播客生态有一定了解，理解行业特征并能提出针对性的产品方案。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "ui-designer",
    title: "UI设计师",
    category: "产品/设计",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-product-design%203",
    sections: [
      {
        title: "职位描述",
        items: ["负责 App 的日常迭代、版本更新以及新功能的整体视觉设计。", "搭建并维护产品的视觉体系，持续提升界面一致性与用户体验。", "与工程团队紧密协作，确保设计、交互与动效的高质量实现。", "与产品团队共同构思更优的交互设计方案，主动发现体验问题并推动优化。"],
      },
      {
        title: "职位要求",
        items: ["本科及以上学历，设计类相关专业优先。", "3 年以上互联网行业 UI / 视觉设计经验，有独立负责关键模块的经历更佳。", "熟练使用 Figma，熟悉移动端（iOS / Android）设计规范与响应式思维。", "具备良好的沟通协作能力，能够与产品、研发顺畅推进项目。"],
      },
      {
        title: "加分项",
        items: ["能熟练使用 AE、Rive 制作 UI 动效或轻量动画。", "善于深入分析问题，逻辑清晰，思路结构化。", "审美优秀，对前沿设计趋势敏锐，保持好奇心与探索精神。", "拥有体现个人风格的作品集，或具备从设计到上线落地的实战项目经验。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "key-account-manager",
    title: "大客户经理",
    category: "运营/市场",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-operation-MKT",
    sections: [
      {
        title: "职位描述",
        items: ["独立完成新客户的开发，了解客户行业和背景。", "准确挖掘客户潜在需求，有效整合运营产品的服务和资源。", "支持商业化业务，完成商务项目日常对接，管理商务项目进度等。", "完成业绩目标，推动商业化制度的有效执行与落地。", "日常维护客户资源库。"],
      },
      {
        title: "职位要求",
        items: ["本科及以上学历，3 至 5 年以上销售 / 商务拓展工作经验。", "具有一定的策划及项目执行经验。", "了解并有意愿从事商业化营销专业领域，有充足的学习和探索欲。", "良好的沟通能力、洞察能力，能够有效发现和捕捉商机。", "有责任心，能够独立解决问题。", "有强烈的客户服务意识，能承受较大的工作压力，结果导向。"],
      },
      {
        title: "加分项",
        items: ["有品牌直客资源，有 4A 公关公司销售经验。", "掌握一定的新客户开发方法。", "对播客内容和营销玩法有一定敏感度。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
  {
    id: "xiaoyuzhou-business-operations",
    title: "小宇宙商务运营-产品运营方向",
    category: "运营/市场",
    locationLabel: LOCATION,
    applyEmail: "hr@iftech.io",
    sourceUrl: "https://www.okjike.com/careers/society-operation-MKT%2010",
    sections: [
      {
        title: "职位描述",
        items: ["负责小宇宙 B 端商业化产品矩阵的规划与长线运营，推动创新变现产品从 0 到 1 落地，赋能销售团队并驱动平台商业化收入增长。", "深入挖掘业务痛点，提炼并推动商业化后台需求落地，提升商业化运转效率。", "负责播客内容投放平台“追光”的日常运营与生态维护，推动标准流程落地与优化。", "建立销售漏斗赋能机制，通过稳定洞察输出与行业观测挖掘高意向销售线索，助力销售拓客。"],
      },
      {
        title: "职位要求",
        items: ["全日制本科及以上学历，3 年以上互联网商业化运营、产品运营经验，有内容社区平台变现经验者优先。", "具备优秀的 owner 意识和跨部门协同推进能力，有过商业化产品从 0 到 1 全链路管理经验者优先。", "具备极强的流程梳理能力，擅长将复杂的非标需求转化为标准 SOP 及平台规则，能在复杂多变的需求中快速定位核心问题。", "对客户需求能及时响应，有较强的抗压能力。", "小宇宙用户优先。"],
      },
      {
        title: "投递须知",
        items: ["请发送个人简历到 hr@iftech.io，标题中注明「应聘 + 职位 + 姓名」。", "建议随信附上你的即刻/小宇宙用户名或其他可以让我们更多了解你的信息。"],
      },
    ],
  },
];

export const jobs: Job[] = jobSeeds.map((job) => ({
  id: job.id,
  title: job.title,
  department: job.category,
  team: inferTeam(job.title),
  category: job.category,
  locationLabel: job.locationLabel,
  level: inferLevel(job.category),
  applyEmail: APPLY_EMAIL_OVERRIDE ?? job.applyEmail,
  sections: job.sections,
  sourceUrl: job.sourceUrl,
  updatedAt: DEFAULT_UPDATED_AT,
}));

export function getJobById(jobId: string) {
  return jobs.find((job) => job.id === jobId);
}

export function getCategoryCounts(inputJobs: Job[]) {
  const counts: Record<JobCategoryFilter, number> = {
    All: inputJobs.length,
    实习: 0,
    技术: 0,
    "产品/设计": 0,
    "运营/市场": 0,
    职能: 0,
  };

  for (const job of inputJobs) {
    counts[job.category] += 1;
  }

  return counts;
}

export function getVisibleJobCategories(inputJobs: Job[]) {
  const counts = getCategoryCounts(inputJobs);
  return JOB_CATEGORIES.filter((category) => category === "All" || counts[category] > 0);
}

export function filterJobsByCategory(inputJobs: Job[], category: JobCategoryFilter) {
  if (category === "All") {
    return inputJobs;
  }
  return inputJobs.filter((job) => job.category === category);
}

export function groupJobsByTeam(inputJobs: Job[]) {
  const grouped = new Map<string, Job[]>();

  for (const job of inputJobs) {
    const existing = grouped.get(job.team);
    if (existing) {
      existing.push(job);
    } else {
      grouped.set(job.team, [job]);
    }
  }

  return Array.from(grouped.entries()).map(([team, teamJobs]) => ({
    team,
    jobs: teamJobs,
  }));
}
