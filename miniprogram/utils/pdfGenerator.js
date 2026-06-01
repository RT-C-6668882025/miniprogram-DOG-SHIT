// utils/pdfGenerator.js
// PDF生成工具 - 包含学术影响预测报告

/**
 * 生成完整的PDF HTML内容
 * @param {Object} paper - 论文数据
 * @returns {String} HTML字符串
 */
function generatePDFHTML(paper) {
  // 确保所有字段都有默认值
  const title = paper.title || 'Untitled Paper';
  const zone = paper.zone || 'C区';
  const content = paper.content || {};
  const metadata = paper.metadata || {};
  const aif = paper.aif || { total: 50, breakdown: {} };
  const reviews = paper.reviews || null;

  // 确保 content 的子字段存在
  const authors = content.authors || ['Anonymous'];
  const affiliations = content.affiliations || ['Unknown Institution'];
  const sections = content.sections || {};
  
  // 确保 sections 的子字段存在
  const abstract = sections.abstract || 'No abstract available.';
  const introduction = sections.introduction || 'No introduction available.';
  const results = sections.results || 'No results available.';
  const conclusion = sections.conclusion || 'No conclusion available.';
  
  // 确保 metadata 的子字段存在
  const doi = metadata.doi || '10.0000/unknown';
  const submitDate = metadata.submitDate || new Date().toISOString();
  const acceptDate = metadata.acceptDate || new Date().toISOString();

  // 计算学术影响预测指标
  const impactPrediction = calculateImpactPrediction(aif, zone);

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
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Times New Roman', 'SimSun', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
    }
    
    .page {
      page-break-after: always;
      min-height: 100vh;
      padding: 40px;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    /* 第一页：封面 */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      min-height: 100vh;
    }
    
    .journal-header {
      margin-bottom: 60px;
    }
    
    .journal-name {
      font-size: 36pt;
      font-weight: bold;
      letter-spacing: 8px;
      color: #1e3a5f;
      margin-bottom: 10px;
    }
    
    .journal-subtitle {
      font-size: 14pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 4px;
    }
    
    .zone-badge {
      display: inline-block;
      padding: 8px 24px;
      background: #dc2626;
      color: white;
      font-size: 18pt;
      font-weight: bold;
      border-radius: 4px;
      margin-bottom: 40px;
    }
    
    .paper-title {
      font-size: 22pt;
      font-weight: bold;
      line-height: 1.4;
      margin-bottom: 40px;
      max-width: 80%;
    }
    
    .authors {
      font-size: 12pt;
      margin-bottom: 20px;
    }
    
    .affiliations {
      font-size: 10pt;
      color: #6b7280;
      margin-bottom: 40px;
    }
    
    .doi-info {
      font-size: 9pt;
      color: #6b7280;
      margin-top: 60px;
    }
    
    /* 第二页：摘要和正文 */
    .content-page h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #1e3a5f;
    }
    
    .content-page h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 18px;
      margin-bottom: 8px;
    }
    
    .content-page p {
      text-align: justify;
      margin-bottom: 12px;
      text-indent: 2em;
    }
    
    .abstract {
      background: #f9fafb;
      padding: 20px;
      border-left: 4px solid #1e3a5f;
      margin-bottom: 24px;
    }
    
    .abstract-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    /* 第三页：AIF评分 */
    .aif-page {
      background: #fafafa;
    }
    
    .aif-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .aif-title {
      font-size: 24pt;
      font-weight: bold;
      color: #1e3a5f;
      margin-bottom: 10px;
    }
    
    .aif-subtitle {
      font-size: 12pt;
      color: #6b7280;
    }
    
    .aif-total {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .aif-score {
      font-size: 72pt;
      font-weight: bold;
      color: #dc2626;
    }
    
    .aif-label {
      font-size: 14pt;
      color: #6b7280;
    }
    
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    
    .breakdown-table th,
    .breakdown-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .breakdown-table th {
      background: #f3f4f6;
      font-weight: bold;
    }
    
    .score-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .score-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #1e3a5f, #dc2626);
      border-radius: 4px;
    }
    
    /* 第四页：学术影响预测报告 */
    .impact-page {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: white;
    }
    
    .impact-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid rgba(255,255,255,0.3);
    }
    
    .impact-title {
      font-size: 28pt;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .impact-subtitle {
      font-size: 12pt;
      opacity: 0.8;
    }
    
    .prediction-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .prediction-card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .prediction-label {
      font-size: 11pt;
      opacity: 0.8;
      margin-bottom: 8px;
    }
    
    .prediction-value {
      font-size: 32pt;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .prediction-desc {
      font-size: 9pt;
      opacity: 0.7;
    }
    
    .prediction-full {
      grid-column: 1 / -1;
    }
    
    .formula-section {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 24px;
      margin-top: 30px;
    }
    
    .formula-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 16px;
    }
    
    .formula {
      font-family: 'Courier New', monospace;
      font-size: 11pt;
      background: rgba(0,0,0,0.3);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
    
    .conclusion-box {
      background: rgba(220, 38, 38, 0.2);
      border: 2px solid rgba(220, 38, 38, 0.5);
      border-radius: 12px;
      padding: 24px;
      margin-top: 30px;
    }
    
    .conclusion-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 12px;
      color: #fca5a5;
    }
    
    .conclusion-text {
      font-size: 11pt;
      line-height: 1.8;
    }
    
    /* 页脚 */
    .page-footer {
      position: fixed;
      bottom: 20px;
      left: 40px;
      right: 40px;
      text-align: center;
      font-size: 9pt;
      color: #6b7280;
    }
    
    .impact-page .page-footer {
      color: rgba(255,255,255,0.6);
    }
  </style>
</head>
<body>
  <!-- 第一页：封面 -->
  <div class="page cover-page">
    <div class="journal-header">
      <div class="journal-name">NATURE</div>
      <div class="journal-subtitle">Absurdity Edition</div>
    </div>
    
    <div class="zone-badge">${zone}</div>
    
    <h1 class="paper-title">${title}</h1>
    
    <div class="authors">
      ${authors.map((author, i) => 
        `${author}${i < authors.length - 1 ? ', ' : ''}`
      ).join('')}
    </div>
    
    <div class="affiliations">
      ${affiliations.map(aff => `* ${aff}`).join('<br>')}
    </div>
    
    <div class="doi-info">
      DOI: ${doi}<br>
      Received: ${submitDate}<br>
      Accepted: ${acceptDate}
    </div>
  </div>
  
  <!-- 第二页：摘要和正文 -->
  <div class="page content-page">
    <div class="abstract">
      <div class="abstract-title">Abstract</div>
      <p style="text-indent: 0;">${abstract}</p>
    </div>
    
    <h2>1. Introduction</h2>
    <p>${introduction}</p>
    
    <h2>2. Methods</h2>
    <p>This study employed a rigorous experimental design with a sample size determined by convenience and funding availability. Data were analyzed using proprietary software that may or may not have been validated.</p>
    
    <h2>3. Results</h2>
    <p>${results}</p>
    
    <h2>4. Discussion</h2>
    <p>These findings challenge conventional wisdom and suggest that further research is urgently needed, preferably funded by generous grants to the authors.</p>
    
    <h2>5. Conclusion</h2>
    <p>${conclusion}</p>
  </div>
  
  <!-- 第三页：AIF评分 -->
  <div class="page aif-page">
    <div class="aif-header">
      <div class="aif-title">Absurdity Impact Factor™</div>
      <div class="aif-subtitle">荒谬学术影响力评估报告</div>
    </div>
    
    <div class="aif-total">
      <div class="aif-score">${(aif?.total || 50).toFixed(1)}</div>
      <div class="aif-label">综合评分</div>
    </div>
    
    <table class="breakdown-table">
      <thead>
        <tr>
          <th>评估维度</th>
          <th>评分</th>
          <th>可视化</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(aif?.breakdown || {}).length > 0 
          ? Object.entries(aif.breakdown).map(([key, value]) => `
            <tr>
              <td>${getDimensionLabel(key)}</td>
              <td>${(value * 100).toFixed(0)}%</td>
              <td>
                <div class="score-bar">
                  <div class="score-bar-fill" style="width: ${value * 100}%"></div>
                </div>
              </td>
            </tr>
          `).join('')
          : '<tr><td colspan="3" style="text-align: center; color: #999;">暂无详细评分数据</td></tr>'
        }
      </tbody>
    </table>
    
    <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
      <strong>评审意见：</strong><br>
      ${reviews ? reviews.reviews.map(r => `
        <p style="margin-top: 12px; font-size: 10pt;">
          <strong>${r.reviewer}</strong> (评分: ${r.score}): ${r.comments}
        </p>
      `).join('') : '本研究通过同行评审，被认为具有极高的荒谬学术价值。'}
    </div>
  </div>
  
  <!-- 第四页：学术影响预测报告 -->
  <div class="page impact-page">
    <div class="impact-header">
      <div class="impact-title">学术影响预测报告</div>
      <div class="impact-subtitle">Academic Impact Forecast Report</div>
    </div>
    
    <div class="prediction-grid">
      <div class="prediction-card">
        <div class="prediction-label">五年后被引用次数预测</div>
        <div class="prediction-value">${impactPrediction.citations5Year}</div>
        <div class="prediction-desc">基于当前荒谬指数的增长趋势</div>
      </div>
      
      <div class="prediction-card">
        <div class="prediction-label">撤稿概率</div>
        <div class="prediction-value">${impactPrediction.retractionProbability}%</div>
        <div class="prediction-desc">考虑到研究的荒谬性，撤稿风险较低</div>
      </div>
      
      <div class="prediction-card">
        <div class="prediction-label">被导师要求重写概率</div>
        <div class="prediction-value">${impactPrediction.rewriteProbability}%</div>
        <div class="prediction-desc">导师可能会质疑研究方法的有效性</div>
      </div>
      
      <div class="prediction-card">
        <div class="prediction-label">被本科生当真概率</div>
        <div class="prediction-value">${impactPrediction.believedByStudents}%</div>
        <div class="prediction-desc">部分学生可能缺乏批判性思维训练</div>
      </div>
      
      <div class="prediction-card prediction-full">
        <div class="prediction-label">顶刊结构符合度</div>
        <div class="prediction-value">${impactPrediction.topJournalStructure}%</div>
        <div class="prediction-desc">本研究严格遵循了顶级期刊的格式要求，包括无意义的数据展示和过度复杂的统计方法</div>
      </div>
    </div>
    
    <div class="formula-section">
      <div class="formula-title">第九产品公式 (Product IX Formula)</div>
      <div class="formula">
        AIF = α·M + β·N + γ·A + δ·F + ε·S + ζ·L + η·E + θ·P
        <br><br>
        其中:<br>
        M = 无意义指数 (Meaninglessness)<br>
        N = 猎奇度 (Novelty)<br>
        A = 反人类逻辑指数 (Absurdity)<br>
        F = 严肃外壳强度 (Formality)<br>
        S = 统计滥用指数 (Statistics Abuse)<br>
        L = 逻辑自洽度 (Logic Consistency)<br>
        E = 情感冷漠度 (Emotional Coldness)<br>
        P = 传播潜力 (Propagability)
      </div>
    </div>
    
    <div class="conclusion-box">
      <div class="conclusion-title">综合评估结论</div>
      <div class="conclusion-text">
        本研究在荒谬学术领域展现出极高的创新性和娱乐价值。尽管其科学意义存疑，但在引发公众对学术出版规范的反思方面具有积极作用。
        建议作者继续保持这种独特的研究风格，同时注意避免被真正的学术机构误用。
        根据预测，该论文将在社交媒体上获得广泛传播，但不太可能被主流学术界认真对待。
      </div>
    </div>
    
    <div class="page-footer">
      Generated by AI · For Entertainment Only · Not for Academic Use
    </div>
  </div>
</body>
</html>`;
}

/**
 * 计算学术影响预测指标
 * @param {Object} aif - AIF评分数据
 * @param {String} zone - 论文分区
 * @returns {Object} 预测指标
 */
function calculateImpactPrediction(aif, zone) {
  // 确保 aif 和 breakdown 存在
  const total = aif?.total || 50;
  const breakdown = aif?.breakdown || {};
  
  // 确保 breakdown 的各项指标有默认值
  const absurdity = breakdown.absurdity || 0.5;
  const shareability = breakdown.shareability || 0.5;
  const formality = breakdown.formality || 0.5;
  const statistics_abuse = breakdown.statistics_abuse || 0.5;
  const logic_consistency = breakdown.logic_consistency || 0.5;
  const meaninglessness = breakdown.meaninglessness || 0.5;
  const novelty = breakdown.novelty || 0.5;
  const emotional_coldness = breakdown.emotional_coldness || 0.5;
  
  // 基础系数
  const zoneMultiplier = {
    'SSS一区': 2.5,
    'S一区': 2.0,
    'A一区': 1.5,
    'B区': 1.0,
    'C区': 0.8
  }[zone] || 1.0;
  
  // 五年引用预测 = 基础值 * 荒谬度 * 传播潜力 * 分区系数
  const baseCitations = 50;
  const citations5Year = Math.round(
    baseCitations * 
    absurdity * 
    shareability * 
    zoneMultiplier * 
    (1 + Math.random() * 0.5)
  );
  
  // 撤稿概率 = 与严肃外壳强度负相关
  const retractionProbability = Math.round(
    (1 - formality) * 30 + 
    statistics_abuse * 20
  );
  
  // 被导师要求重写概率 = 与逻辑自洽度负相关
  const rewriteProbability = Math.round(
    (1 - logic_consistency) * 60 + 
    absurdity * 25
  );
  
  // 被本科生当真概率 = 与严肃外壳强度正相关，与无意义指数负相关
  const believedByStudents = Math.round(
    formality * 40 + 
    (1 - meaninglessness) * 30 +
    novelty * 20
  );
  
  // 顶刊结构符合度 = 综合评分
  const topJournalStructure = Math.round(
    (formality * 0.3 + 
     statistics_abuse * 0.2 + 
     emotional_coldness * 0.2 +
     logic_consistency * 0.15 +
     shareability * 0.15) * 100
  );
  
  return {
    citations5Year,
    retractionProbability: Math.min(retractionProbability, 95),
    rewriteProbability: Math.min(rewriteProbability, 98),
    believedByStudents: Math.min(believedByStudents, 85),
    topJournalStructure: Math.min(topJournalStructure, 99)
  };
}

/**
 * 获取维度标签
 * @param {String} key - 维度key
 * @returns {String} 中文标签
 */
function getDimensionLabel(key) {
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
 * 生成PDF文件
 * @param {Object} paper - 论文数据
 * @returns {Promise} 返回PDF文件路径
 */
async function generatePDF(paper) {
  const html = generatePDFHTML(paper);
  
  // 在实际环境中，这里应该调用云函数或后端服务生成PDF
  // 目前返回HTML内容，可以在webview中预览
  return {
    html,
    title: paper.title,
    filename: `paper_${paper._id || Date.now()}.pdf`
  };
}

module.exports = {
  generatePDF,
  generatePDFHTML,
  calculateImpactPrediction
};
