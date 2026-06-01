// cloudfunctions/pdfGenerator/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

/**
 * PDF 生成服务
 * 生成仿 Nature 风格的学术 PDF
 */
exports.main = async (event, context) => {
  const { action, paperId, paperData } = event;

  switch (action) {
    case 'generatePDF':
      return generatePDF(paperId || paperData);
    case 'generatePoster':
      return generatePoster(paperId || paperData);
    default:
      return { error: 'Unknown action' };
  }
};

/**
 * 生成 PDF
 * 注意：由于云函数限制，实际 PDF 生成需要使用独立 Node.js 服务
 * 这里返回 HTML 模板，由前端或独立服务处理
 */
async function generatePDF(paperInput) {
  // 如果传入了 paperId，从数据库获取
  let paper;
  if (typeof paperInput === 'string') {
    const db = cloud.database();
    const result = await db.collection('papers').doc(paperInput).get();
    paper = result.data;
  } else {
    paper = paperInput;
  }

  if (!paper) {
    return { error: 'Paper not found' };
  }

  // 生成 HTML 模板
  const html = generatePaperHTML(paper);

  // 由于云函数限制，这里返回 HTML 内容
  // 实际生产环境应调用独立的 PDF 生成服务
  return {
    html,
    paperId: paper._id,
    title: paper.title,
    // 实际项目中，这里应该返回上传到云存储后的 PDF URL
    pdfUrl: null,
    note: '请使用独立 Node.js 服务处理 PDF 生成'
  };
}

/**
 * 生成论文 HTML 模板
 */
function generatePaperHTML(paper) {
  const { title, content, metadata, aif, zone } = paper;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
    }

    .paper {
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }

    /* 页眉 */
    .header {
      text-align: center;
      border-bottom: 2px solid #1e3a5f;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .journal-name {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: 3px;
      color: #1e3a5f;
    }

    .journal-subtitle {
      font-size: 10pt;
      color: #6b7280;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 5px;
    }

    /* 标题区 */
    .title-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .paper-title {
      font-size: 16pt;
      font-weight: bold;
      line-height: 1.4;
      margin-bottom: 20px;
    }

    .authors {
      font-size: 11pt;
      margin-bottom: 10px;
    }

    .affiliations {
      font-size: 9pt;
      color: #6b7280;
      font-style: italic;
    }

    /* 摘要 */
    .abstract {
      background: #f9fafb;
      padding: 20px;
      margin: 30px 0;
      border-left: 3px solid #1e3a5f;
    }

    .abstract-title {
      font-weight: bold;
      margin-bottom: 10px;
    }

    /* 正文 - 双栏布局 */
    .content-columns {
      column-count: 2;
      column-gap: 40px;
      column-rule: 1px solid #e5e7eb;
    }

    .section {
      margin-bottom: 25px;
      break-inside: avoid;
    }

    .section-title {
      font-size: 13pt;
      font-weight: bold;
      color: #1e3a5f;
      margin-bottom: 15px;
    }

    .subsection-title {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .paragraph {
      text-align: justify;
      margin-bottom: 12px;
      text-indent: 2em;
    }

    /* 图表 */
    .figure {
      margin: 20px 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .figure-caption {
      font-size: 9pt;
      text-align: center;
      color: #6b7280;
      margin-top: 10px;
    }

    /* 参考文献 */
    .references {
      margin-top: 40px;
      column-count: 2;
    }

    .reference-item {
      font-size: 9pt;
      margin-bottom: 8px;
      break-inside: avoid;
    }

    /* 评分页 */
    .aif-page {
      page-break-before: always;
      padding-top: 50px;
    }

    .aif-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .aif-score {
      font-size: 48pt;
      font-weight: bold;
      color: #1e3a5f;
    }

    .aif-zone {
      font-size: 24pt;
      color: #dc2626;
      margin-top: 10px;
    }

    .aif-breakdown {
      margin: 30px auto;
      max-width: 400px;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .breakdown-label {
      color: #6b7280;
    }

    .breakdown-score {
      font-weight: bold;
      color: #1e3a5f;
    }

    /* 认证页 */
    .cert-page {
      page-break-before: always;
      text-align: center;
      padding-top: 100px;
    }

    .cert-border {
      border: 3px double #1e3a5f;
      padding: 60px;
      max-width: 500px;
      margin: 0 auto;
    }

    .cert-title {
      font-size: 20pt;
      font-weight: bold;
      color: #1e3a5f;
      margin-bottom: 40px;
    }

    .cert-content {
      font-size: 14pt;
      line-height: 2;
    }
  </style>
</head>
<body>
  <div class="paper">
    <!-- 第一页：论文正文 -->
    <div class="header">
      <div class="journal-name">NATURE</div>
      <div class="journal-subtitle">Absurdity Edition · Vol ${metadata.volume || 1} · Issue ${metadata.issue || 1}</div>
    </div>

    <div class="title-section">
      <h1 class="paper-title">${title}</h1>
      <div class="authors">${(content.authors || []).join(' · ')}</div>
      <div class="affiliations">${(content.affiliations || []).join(' · ')}</div>
    </div>

    <div class="abstract">
      <div class="abstract-title">摘要</div>
      <div>${content.sections?.abstract || '本文通过严谨的实证研究方法，深入探讨了...'}</div>
    </div>

    <div class="content-columns">
      <div class="section">
        <div class="section-title">1. 引言</div>
        <div class="paragraph">${content.sections?.introduction || '近年来，关于...'}</div>
      </div>

      <div class="section">
        <div class="section-title">2. 方法</div>
        <div class="paragraph">${content.sections?.methods || '本研究采用...'}</div>
      </div>

      <div class="section">
        <div class="section-title">3. 结果</div>
        <div class="paragraph">${content.sections?.results || '实验结果显示...'}</div>

        <div class="figure">
          <div style="background: #f3f4f6; height: 200px; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
            [图表占位]
          </div>
          <div class="figure-caption">图1：${content.figures?.[0]?.caption || '实验结果图表'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">4. 讨论</div>
        <div class="paragraph">${content.sections?.discussion || '研究结果表明...'}</div>
      </div>

      <div class="section">
        <div class="section-title">5. 结论</div>
        <div class="paragraph">${content.sections?.conclusion || '综上所述...'}</div>
      </div>
    </div>

    <div class="references">
      <div class="section-title">参考文献</div>
      ${(content.references || []).map((ref, i) => `
        <div class="reference-item">
          ${i + 1}. ${ref.authors?.join(', ')}. ${ref.title}. <em>${ref.journal}</em>, ${ref.year}.
        </div>
      `).join('')}
    </div>

    <!-- 第二页：AIF 评分 -->
    <div class="aif-page">
      <div class="aif-header">
        <div>荒谬影响因子</div>
        <div class="aif-score">${aif?.total || 0}</div>
        <div class="aif-zone">${zone || 'C区'}</div>
      </div>

      <div class="aif-breakdown">
        ${Object.entries(aif?.breakdown || {}).map(([key, value]) => `
          <div class="breakdown-item">
            <span class="breakdown-label">${getBreakdownLabel(key)}</span>
            <span class="breakdown-score">${(value * 100).toFixed(1)}</span>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center; margin-top: 40px; color: #6b7280;">
        <p>DOI: ${metadata?.doi || ''}</p>
        <p>收稿日期: ${metadata?.submitDate || ''}</p>
        <p>接收日期: ${metadata?.acceptDate || ''}</p>
      </div>
    </div>

    <!-- 第三页：认证页 -->
    <div class="cert-page">
      <div class="cert-border">
        <div class="cert-title">荒谬学术认证</div>
        <div class="cert-content">
          <p>兹证明</p>
          <p><strong>${title}</strong></p>
          <p>经本刊评审委员会评定</p>
          <p>被正式收录为 <strong>${zone || 'C区'}</strong> 论文</p>
          <p>荒谬影响因子: <strong>${aif?.total || 0}</strong></p>
          <br><br>
          <p style="color: #6b7280;">Nature Absurdity Edition</p>
          <p style="color: #6b7280; font-size: 10pt;">本认证仅供娱乐，不代表任何学术观点</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 获取评分维度中文标签
 */
function getBreakdownLabel(key) {
  const labels = {
    meaninglessness: '无意义指数',
    novelty: '猎奇度',
    absurdity: '反人类逻辑指数',
    formality: '严肃外壳强度',
    statistics_abuse: '统计滥用指数',
    logic_consistency: '逻辑自洽度',
    emotional_coldness: '情感冷漠度',
    shareability: '传播潜力'
  };
  return labels[key] || key;
}

/**
 * 生成朋友圈海报
 * 返回 Canvas 绘制所需的配置
 */
async function generatePoster(paperInput) {
  let paper;
  if (typeof paperInput === 'string') {
    const db = cloud.database();
    const result = await db.collection('papers').doc(paperInput).get();
    paper = result.data;
  } else {
    paper = paperInput;
  }

  return {
    config: {
      width: 750,
      height: 1200,
      backgroundColor: '#ffffff',
      elements: [
        // 顶部装饰
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 750,
          height: 8,
          color: 'linear-gradient(90deg, #1e3a5f, #2d5a87)'
        },
        // 期刊名称
        {
          type: 'text',
          x: 375,
          y: 80,
          text: 'NATURE',
          fontSize: 48,
          color: '#1e3a5f',
          align: 'center',
          fontWeight: 'bold'
        },
        {
          type: 'text',
          x: 375,
          y: 120,
          text: 'Absurdity Edition',
          fontSize: 24,
          color: '#6b7280',
          align: 'center'
        },
        // 分区标签
        {
          type: 'rect',
          x: 275,
          y: 180,
          width: 200,
          height: 50,
          color: '#dc2626',
          borderRadius: 25
        },
        {
          type: 'text',
          x: 375,
          y: 215,
          text: paper.zone || 'C区',
          fontSize: 28,
          color: '#ffffff',
          align: 'center',
          fontWeight: 'bold'
        },
        // 标题
        {
          type: 'text',
          x: 60,
          y: 320,
          text: paper.title,
          fontSize: 36,
          color: '#1a1a1a',
          width: 630,
          lineHeight: 50
        },
        // AIF 分数
        {
          type: 'text',
          x: 60,
          y: 550,
          text: 'AIF',
          fontSize: 60,
          color: '#1e3a5f',
          fontWeight: 'bold'
        },
        {
          type: 'text',
          x: 60,
          y: 630,
          text: (paper.aif?.total || 0).toString(),
          fontSize: 100,
          color: '#dc2626',
          fontWeight: 'bold'
        },
        // 底部信息
        {
          type: 'text',
          x: 375,
          y: 900,
          text: `DOI: ${paper.metadata?.doi || ''}`,
          fontSize: 24,
          color: '#6b7280',
          align: 'center'
        },
        {
          type: 'text',
          x: 375,
          y: 950,
          text: 'Generated by AI · For Entertainment Only',
          fontSize: 20,
          color: '#9ca3af',
          align: 'center'
        },
        // 二维码占位
        {
          type: 'rect',
          x: 275,
          y: 1000,
          width: 200,
          height: 150,
          color: '#f3f4f6',
          borderRadius: 8
        }
      ]
    },
    paperId: paper._id
  };
}
