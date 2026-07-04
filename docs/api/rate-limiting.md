---
title: API 限流策略
---

# API 限流策略

## 限流规则

Zen Platform API 使用 rack-attack 进行请求限流。

### 认证端点
| 端点 | 限制 | 窗口 |
|------|------|------|
| POST /api/v1/auth/login | 5 次 | 20 秒 |

### 普通 API 端点
| 认证方式 | 限制 | 窗口 |
|----------|------|------|
| IP | 60 次 | 60 秒 |
| API Key | 300 次 | 60 秒 |

### Admin UI
| 限制 | 窗口 |
|------|------|
| 300 次 | 60 秒 |

### 超限响应

HTTP Status: 429

响应头:
- `X-RateLimit-Limit` — 窗口内最大请求数
- `X-RateLimit-Remaining` — 剩余请求数
- `X-RateLimit-Reset` — 重置时间
- `Retry-After` — 等待秒数

## 配置

在 `config/initializers/rack_attack.rb` 中自定义限流规则。
