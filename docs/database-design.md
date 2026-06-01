# 荒谬论文系统 - 数据库设计文档

## 集合结构

### 1. papers (论文集合)

存储每篇生成的荒谬论文。

```json
{
  "_id": "paper_xxxxx",
  "openid": "用户OpenID",
  "title": "拖鞋对量子纠缠的宏观影响：一项跨物种实验研究",
  "content": {
    "authors": ["张三", "李四", "王五"],
    "affiliations": ["荒谬物理学研究所", "跨维度科学实验室"],
    "abstract": "本文研究了...",
    "sections": {
      "introduction": "...",
      "methods": "...",
      "results": "...",
      "discussion": "...",
      "conclusion": "..."
    },
    "figures": [
      {
        "type": "chart",
        "caption": "图1：拖鞋对量子纠缠的影响",
        "dataUrl": "cloud://xxx.png"
      }
    ],
    "references": [
      {"title": "...", "authors": ["..."], "year": 2024, "journal": "Nature Absurdity"}
    ]
  },
  "metadata": {
    "doi": "10.1038/absurd.2024.001",
    "submitDate": "2024-01-15",
    "acceptDate": "2024-01-20",
    "volume": 1,
    "issue": 1,
    "pages": "1-8"
  },
  "aif": {
    "total": 98.5,
    "breakdown": {
      "meaninglessness": 19.5,
      "novelty": 14.8,
      "absurdity": 14.9,
      "formality": 14.7,
      "statistics_abuse": 9.8,
      "logic_consistency": 9.5,
      "emotional_coldness": 9.8,
      "shareability": 4.9
    }
  },
  "zone": "SSS一区",
  "citations": 1247,
  "shares": 356,
  "pdfUrl": "cloud://xxx.pdf",
  "posterUrl": "cloud://xxx.png",
  "qrCodeUrl": "cloud://xxx.png",
  "status": "published",
  "createdAt": {"$date": "2024-01-15T10:00:00Z"},
  "updatedAt": {"$date": "2024-01-15T10:00:00Z"}
}
```

### 2. rankings (排行榜集合)

存储各种维度的排行榜数据。

```json
{
  "_id": "ranking_weekly",
  "type": "weekly",
  "period": "2024-W03",
  "papers": [
    {"paperId": "paper_xxxxx", "rank": 1, "aif": 98.5, "citations": 1247},
    {"paperId": "paper_yyyyy", "rank": 2, "aif": 95.2, "citations": 892}
  ],
  "lastUpdated": {"$date": "2024-01-21T00:00:00Z"}
}
```

### 3. users (用户集合)

存储用户基本信息。

```json
{
  "_id": "user_xxxxx",
  "openid": "用户OpenID",
  "profile": {
    "nickname": "学术荒谬家",
    "avatar": "https://...",
    "bio": "专注于无意义研究"
  },
  "stats": {
    "papersCount": 5,
    "totalCitations": 3567,
    "highestAIF": 98.5,
    "bestZone": "SSS一区"
  },
  "papers": ["paper_xxxxx", "paper_yyyyy"],
  "createdAt": {"$date": "2024-01-01T00:00:00Z"}
}
```

### 4. reviews (审稿意见集合)

存储每篇论文的审稿意见。

```json
{
  "_id": "review_xxxxx",
  "paperId": "paper_xxxxx",
  "reviews": [
    {
      "reviewer": "Reviewer 1",
      "role": "审稿专家",
      "comments": "该研究开创了拖鞋量子纠缠的新领域...",
      "decision": "accept",
      "score": 9.5
    },
    {
      "reviewer": "Reviewer 2",
      "role": "刻薄审稿人",
      "comments": "完全是一派胡言，但格式完美...",
      "decision": "accept_minor",
      "score": 8.8
    }
  ],
  "editorDecision": {
    "decision": "accept",
    "comments": "经讨论，决定录用至SSS一区"
  },
  "createdAt": {"$date": "2024-01-15T10:00:00Z"}
}
```

## 索引设计

### papers 集合索引

```javascript
// 按用户查询论文
db.papers.createIndex({ openid: 1, createdAt: -1 })

// 按分区查询
db.papers.createIndex({ zone: 1, aif: -1 })

// 按引用数排序
db.papers.createIndex({ citations: -1 })

// 按AIF分数排序
db.papers.createIndex({ "aif.total": -1 })

// 全文搜索标题
db.papers.createIndex({ title: "text" })
```

### rankings 集合索引

```javascript
db.rankings.createIndex({ type: 1, period: -1 })
```

## 分区规则

| AIF 分数 | 分区等级 | 颜色标识 |
|----------|----------|----------|
| 90+ | SSS一区 | #dc2626 (深红) |
| 80-89 | S一区 | #ea580c (橙色) |
| 70-79 | A一区 | #16a34a (绿色) |
| 60-69 | B区 | #2563eb (蓝色) |
| <60 | C区 | #6b7280 (灰色) |
