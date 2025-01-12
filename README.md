# 评价反馈系统

一个优雅的评价反馈系统，支持用户注册、评价收集和结果分析。

## 功能特点

- 用户注册和认证
- 评价表单生成
- 评价数据收集
- 评价数据可视化
- AI驱动的印象总结
- 留言板功能

## 技术栈

- Next.js 14.1.0
- Upstash Redis
- NextAuth.js
- TailwindCSS
- 豆包 AI API
- D3.js 词云可视化

## 系统特点

- 用户注册时自动生成6位数字ID
- JWT身份验证（存储在httpOnly cookie中）
- 密码使用bcrypt加密存储
- 自动重定向未登录用户
- React Context全局状态管理
- 优雅的暗色主题UI

## 开始使用

1. 克隆项目
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env.local` 文件并配置以下变量：
```env
NEXTAUTH_SECRET=你的密钥
OPENAI_API_KEY=你的AI API密钥
OPENAI_BASE_URL=你的AI API基础URL
OPENAI_MODEL=你的模型ID
NEXTAUTH_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=你的Redis URL
UPSTASH_REDIS_REST_TOKEN=你的Redis Token
```

4. 运行开发服务器
```bash
npm run dev
```

## 部署

本项目可以部署在 Vercel 上：

1. 在 Vercel 上导入项目
2. 配置环境变量
3. 部署

## 注意事项

- 确保在生产环境中使用安全的 NEXTAUTH_SECRET
- Redis 凭据请妥善保管
- AI API 密钥不要泄露

## 许可证

MIT License
