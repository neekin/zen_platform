<template>
  <div class="landing">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          v1.1.0 — 开源免费
        </div>
        <h1 class="hero-title">
          <span class="gradient-text">声明式</span>全栈应用生成平台
        </h1>
        <p class="hero-desc">
          在 Model 中用 DSL 声明字段、关联、展示方式<br>
          <span class="highlight">自动生成完整的管理后台 + API</span>
        </p>
        <div class="hero-actions">
          <a href="/guide/quick-start" class="btn btn-primary">
            <span>🚀</span> 快速上手
          </a>
          <a href="https://github.com/neekin/zen_platform" class="btn btn-glass" target="_blank">
            GitHub
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">20+</span>
            <span class="stat-label">富文本插件</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">5</span>
            <span class="stat-label">产品形态</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">4</span>
            <span class="stat-label">认证方式</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">98%</span>
            <span class="stat-label">代码自动生成</span>
          </div>
        </div>
      </div>
    </section>

    <!-- DSL Demo Section -->
    <section class="section" id="dsl">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">声明即所得</span>
          <h2 class="section-title">一行 DSL，生成整个后台</h2>
          <p class="section-desc">在 Model 中声明一次，前端自动渲染。无需手写 CRUD。</p>
        </div>
        <div class="code-showcase">
          <div class="code-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="code-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          <div v-show="activeTab === 'model'" class="code-panel">
            <div class="code-header">
              <div class="code-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="code-filename">app/models/article.rb</span>
            </div>
            <pre><code class="ruby"><span class="kw">class</span> <span class="cls">Article</span> &lt; <span class="cls">ApplicationRecord</span>
  <span class="kw">include</span> <span class="mod">Zen::ModelDsl</span>

  <span class="fn">field</span> <span class="sym">:title</span>, <span class="sym">:string</span>, <span class="key">required:</span> <span class="bool">true</span>
  <span class="fn">field</span> <span class="sym">:body</span>, <span class="sym">:rich_text</span>
  <span class="fn">field</span> <span class="sym">:status</span>, <span class="sym">:enum</span>, <span class="key">values:</span> <span class="val">%w[draft published]</span>

  <span class="fn">belongs_to</span> <span class="sym">:category</span>

  <span class="fn">display</span> <span class="kw">do</span>
    <span class="fn">list</span> <span class="kw">do</span>
      <span class="fn">column</span> <span class="sym">:title</span>, <span class="key">link:</span> <span class="bool">true</span>
      <span class="fn">column</span> <span class="sym">:status</span>, <span class="key">badge:</span> <span class="bool">true</span>
    <span class="kw">end</span>
    <span class="fn">form</span> <span class="kw">do</span>
      <span class="fn">field</span> <span class="sym">:title</span>
      <span class="fn">field</span> <span class="sym">:body</span>, <span class="key">as:</span> <span class="sym">:rich_text</span>
    <span class="kw">end</span>
  <span class="kw">end</span>
<span class="kw">end</span></code></pre>
          </div>
          <div v-show="activeTab === 'controller'" class="code-panel">
            <div class="code-header">
              <div class="code-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="code-filename">app/controllers/admin/articles_controller.rb</span>
            </div>
            <pre><code class="ruby"><span class="cmt"># 自动生成，无需手写</span>
<span class="kw">class</span> <span class="cls">Admin::ArticlesController</span> &lt; <span class="cls">AdminController</span>
  <span class="kw">include</span> <span class="mod">Pagy::Method</span>

  <span class="fn">def</span> <span class="fn">index</span>
    q = <span class="cls">Article</span>.<span class="fn">ransack</span>(search_params)
    <span class="var">@pagy</span>, articles = <span class="fn">pagy</span>(<span class="sym">:offset</span>, q.<span class="fn">result</span>, <span class="var">**</span><span class="fn">pagy_params</span>)
    <span class="fn">render</span> <span class="key">inertia:</span> <span class="str">"admin/articles/Index"</span>,
      <span class="key">props:</span> <span class="fn">zen_props</span>(<span class="cls">Article</span>, articles: articles)
  <span class="kw">end</span>
<span class="kw">end</span></code></pre>
          </div>
          <div v-show="activeTab === 'result'" class="code-panel">
            <div class="code-header">
              <div class="code-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="code-filename">生成的内容</span>
            </div>
            <div class="result-grid">
              <div class="result-card glass-card">
                <div class="result-icon">📋</div>
                <div class="result-title">CRUD 表格</div>
                <div class="result-desc">自动生成列表、搜索、分页、过滤</div>
              </div>
              <div class="result-card glass-card">
                <div class="result-icon">📝</div>
                <div class="result-title">表单页面</div>
                <div class="result-desc">Modal 或独立页面，支持富文本</div>
              </div>
              <div class="result-card glass-card">
                <div class="result-icon">🔐</div>
                <div class="result-title">权限控制</div>
                <div class="result-desc">Pundit Policy + Rolify 角色</div>
              </div>
              <div class="result-card glass-card">
                <div class="result-icon">📊</div>
                <div class="result-title">API 端点</div>
                <div class="result-desc">RESTful API + Swagger 文档</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section section-dark" id="features">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">核心特性</span>
          <h2 class="section-title">为什么选择 Zen Platform？</h2>
          <p class="section-desc">我们重新定义了管理后台的开发方式</p>
        </div>
        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card glass-card"
          >
            <div class="feature-icon-wrap">
              <span class="feature-icon">{{ feature.icon }}</span>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
            <div class="feature-tag">{{ feature.tag }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="section" id="stack">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">技术栈</span>
          <h2 class="section-title">现代化技术栈</h2>
          <p class="section-desc">基于成熟稳定的技术构建</p>
        </div>
        <div class="stack-grid">
          <div v-for="item in stack" :key="item.name" class="stack-item">
            <div class="stack-icon">{{ item.icon }}</div>
            <div class="stack-name">{{ item.name }}</div>
            <div class="stack-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section cta-section">
      <div class="container">
        <h2>开始构建你的管理后台</h2>
        <p>只需几行代码，即可生成完整的 CRUD 界面</p>
        <div class="hero-actions">
          <a href="/guide/quick-start" class="btn btn-primary">📖 阅读文档</a>
          <a href="https://github.com/neekin/zen_platform" class="btn btn-glass" target="_blank">⭐ GitHub</a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('model')

const tabs = [
  { id: 'model', label: 'Model DSL' },
  { id: 'controller', label: 'Controller' },
  { id: 'result', label: '生成结果' },
]

const features = [
  { icon: '📝', title: 'Model DSL', desc: '声明字段、关联、展示配置，自动生成 JSON Schema 驱动前端渲染。一次声明，多处使用。', tag: '声明式' },
  { icon: '✏️', title: '富文本引擎', desc: 'Lexical 驱动，20+ 插件：Mermaid 图表、KaTeX 公式、代码高亮、视频嵌入、@提及。', tag: '开箱即用' },
  { icon: '🎨', title: '多产品形态', desc: 'CRUD 表格、看板拖拽、日历视图、画廊网格。一行 DSL 切换，无需重写代码。', tag: '灵活' },
  { icon: '🔐', title: '企业级权限', desc: 'Pundit + Rolify RBAC，4 级角色，资源级授权。动态权限矩阵，运行时可配置。', tag: '安全' },
  { icon: '👤', title: '用户系统', desc: '个人中心、头像上传、手机绑定、验证码登录、密码重置。开箱即用的用户管理。', tag: '完整' },
  { icon: '🚀', title: '一键生成', desc: 'rails generate zen:admin 自动生成 Controller + 页面 + 路由 + 测试 + Swagger。', tag: '高效' },
]

const stack = [
  { icon: '💎', name: 'Ruby on Rails 8', desc: '后端框架' },
  { icon: '⚛️', name: 'React 19', desc: '前端框架' },
  { icon: '🔄', name: 'Inertia.js', desc: '全栈桥梁' },
  { icon: '🐜', name: 'Ant Design 6', desc: 'UI 组件库' },
  { icon: '📝', name: 'Lexical', desc: '富文本引擎' },
  { icon: '🔌', name: 'ActionCable', desc: 'WebSocket' },
]
</script>

<style scoped>
.landing {
  position: relative;
  overflow: hidden;
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 20s infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #D4A537, #F0D060);
  top: -200px;
  right: -200px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #1677FF, #4096FF);
  bottom: -100px;
  left: -100px;
  animation-delay: -7s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #52c41a, #73d13d);
  top: 50%;
  left: 50%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, -50px) scale(1.1); }
  50% { transform: translate(-30px, 30px) scale(0.9); }
  75% { transform: translate(20px, 20px) scale(1.05); }
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
}

.hero-content {
  max-width: 800px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(212, 165, 55, 0.1);
  border: 1px solid rgba(212, 165, 55, 0.3);
  border-radius: 24px;
  font-size: 14px;
  color: #D4A537;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #52c41a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 8px rgba(82, 196, 26, 0); }
}

.hero-title {
  font-size: 72px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
  color: var(--vp-c-text-1);
}

.gradient-text {
  background: linear-gradient(135deg, #F0D060 0%, #D4A537 40%, #A07F1E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 20px;
  color: var(--vp-c-text-2);
  line-height: 1.8;
  margin-bottom: 48px;
}

.highlight {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 80px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #F0D060 0%, #D4A537 50%, #A07F1E 100%);
  color: #1a1a1a;
  box-shadow: 0 4px 24px rgba(212, 165, 55, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(212, 165, 55, 0.5);
}

.btn-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--vp-c-text-1);
  backdrop-filter: blur(10px);
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 40px;
  font-weight: 700;
  background: linear-gradient(135deg, #F0D060 0%, #D4A537 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, transparent, var(--vp-c-divider), transparent);
}

/* Sections */
.section {
  padding: 100px 0;
}

.section-dark {
  background: rgba(0, 0, 0, 0.02);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-tag {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, rgba(212, 165, 55, 0.1), rgba(240, 208, 96, 0.05));
  border: 1px solid rgba(212, 165, 55, 0.2);
  color: #D4A537;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}

.section-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 16px;
  line-height: 1.3;
}

.section-desc {
  font-size: 18px;
  color: var(--vp-c-text-2);
  max-width: 600px;
  margin: 0 auto;
}

/* Code Showcase */
.code-showcase {
  background: #1e1e1e;
  border-radius: 16px;
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
}

.code-tabs {
  display: flex;
  background: #252526;
  border-bottom: 1px solid #333;
  padding: 0 16px;
}

.code-tab {
  padding: 14px 24px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.code-tab.active {
  color: #fff;
}

.code-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #D4A537, #F0D060);
}

.code-panel {
  padding: 24px;
}

.code-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.code-dots {
  display: flex;
  gap: 8px;
}

.code-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.code-dots span:first-child { background: #ff5f56; }
.code-dots span:nth-child(2) { background: #ffbd2e; }
.code-dots span:last-child { background: #27c93f; }

.code-filename {
  color: #999;
  font-size: 13px;
  font-family: monospace;
}

.code-panel pre {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  overflow-x: auto;
}

.code-panel code {
  color: #d4d4d4;
  font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
}

.kw { color: #569cd6; }
.cls { color: #4ec9b0; }
.mod { color: #4ec9b0; }
.fn { color: #dcdcaa; }
.sym { color: #ce9178; }
.key { color: #9cdcfe; }
.bool { color: #569cd6; }
.val { color: #ce9178; }
.str { color: #ce9178; }
.cmt { color: #6a9955; }
.var { color: #9cdcfe; }

/* Result Grid */
.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.result-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
}

.result-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(212, 165, 55, 0.3);
  transform: translateY(-2px);
}

.result-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.result-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 36px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #D4A537, transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(212, 165, 55, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon-wrap {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(212, 165, 55, 0.1), rgba(240, 208, 96, 0.05));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.feature-icon {
  font-size: 32px;
}

.feature-card h3 {
  font-size: 22px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin-bottom: 20px;
}

.feature-tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(212, 165, 55, 0.1), rgba(240, 208, 96, 0.05));
  border: 1px solid rgba(212, 165, 55, 0.2);
  color: #D4A537;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* Stack Grid */
.stack-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.stack-item {
  text-align: center;
  padding: 28px 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  transition: all 0.3s;
}

.stack-item:hover {
  transform: translateY(-4px);
  border-color: rgba(212, 165, 55, 0.3);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
}

.stack-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.stack-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.stack-desc {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* CTA Section */
.cta-section {
  text-align: center;
  background: linear-gradient(135deg, rgba(212, 165, 55, 0.03) 0%, rgba(240, 208, 96, 0.01) 100%);
}

.cta-section h2 {
  font-size: 42px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 16px;
}

.cta-section p {
  font-size: 18px;
  color: var(--vp-c-text-2);
  margin-bottom: 48px;
}

/* Glass Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Responsive */
@media (max-width: 960px) {
  .hero-title {
    font-size: 48px;
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: 24px;
  }

  .stat-divider {
    display: none;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stack-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .section-title {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 36px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stack-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-grid {
    grid-template-columns: 1fr;
  }

  .cta-section h2 {
    font-size: 28px;
  }
}
</style>
