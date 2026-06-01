// pages/detail/detail.js
Page({
  data: {
    paper: {},
    zoneClass: '',
    breakdownList: [],
    shareModalVisible: false,
    showPoster: false,
    loading: false,
    error: ''
  },

  onLoad(options) {
    const paperId = options.id;

    if (paperId) {
      // 尝试加载排行榜论文
      const rankingPaper = this.loadRankingPaper(paperId);
      if (rankingPaper) {
        this.initPaperData(rankingPaper);
      } else {
        this.loadPaper(paperId);
      }
    } else {
      // 模拟数据（开发测试用）
      this.loadMockPaper();
    }
  },

  /**
   * 加载排行榜论文数据
   */
  loadRankingPaper(paperId) {
    // 排行榜论文数据
    const rankingPapers = {
      // 本周一区榜
      '1': {
        _id: '1',
        title: "拖鞋对量子纠缠的宏观影响：一项跨物种实验研究",
        zone: 'SSS一区',
        content: {
          authors: ['张三', '李四'],
          affiliations: ['荒谬大学量子拖鞋研究所', '跨物种实验中心'],
          sections: {
            abstract: '本研究通过严谨的实验设计，探讨了拖鞋材质对量子纠缠现象的宏观影响。研究发现，棉质拖鞋能够显著增强量子纠缠的稳定性，而塑料拖鞋则会导致量子态的快速退相干。这一发现为量子拖鞋学的发展奠定了重要基础。',
            introduction: '量子纠缠作为量子力学的核心现象之一，一直是物理学研究的热点。然而，关于日常用品对量子纠缠影响的研究却鲜有报道。本研究首次系统性地探讨了拖鞋这一常见 footwear 对量子纠缠的影响，填补了该领域的研究空白。',
            results: '实验结果表明，在室温条件下，穿着棉质拖鞋的实验组显示出更强的量子纠缠保持能力（p<0.001）。具体而言，棉质拖鞋组的纠缠持续时间比对照组延长了约 15.7%。相比之下，塑料拖鞋组的量子纠缠几乎在瞬间消失。',
            conclusion: '本研究证实了拖鞋材质对量子纠缠具有显著影响。这一发现不仅具有重要的理论意义，也为未来量子计算设备的 footwear 设计提供了实践指导。我们建议在进行精密量子实验时，研究人员应优先考虑穿着棉质拖鞋。'
          }
        },
        metadata: {
          doi: "10.1038/absurd.2024.001",
          submitDate: "2024-01-15",
          acceptDate: "2024-02-01"
        },
        aif: {
          total: 98.5,
          breakdown: {
            meaninglessness: 0.95,
            novelty: 0.92,
            absurdity: 0.94,
            formality: 0.96,
            statistics_abuse: 0.88,
            logic_consistency: 0.90,
            emotional_coldness: 0.93,
            shareability: 0.91
          }
        },
        reviews: {
          reviews: [
            {
              reviewer: 'Reviewer 1',
              role: '量子物理学家',
              comments: '这项研究开创性地将日常用品与量子现象联系起来，实验设计严谨，数据分析令人信服。强烈建议发表在 SSS 一区。',
              decision: 'accept',
              score: '9.8'
            },
            {
              reviewer: 'Reviewer 2',
              role: '拖鞋学专家',
              comments: '作为拖鞋学领域的开创性研究，本文具有里程碑意义。建议补充不同品牌拖鞋的对比实验。',
              decision: 'accept_minor',
              score: '9.5'
            }
          ],
          editorDecision: {
            decision: 'accept',
            comments: '经审稿，该研究具有极高的创新性和学术价值，SSS一区录用'
          }
        }
      },
      '2': {
        _id: '2',
        title: "方便面与存在主义哲学的实证分析：基于深夜食堂视角",
        zone: 'SSS一区',
        content: {
          authors: ['王五', '赵六'],
          affiliations: ['深夜食堂研究所', '存在主义哲学系'],
          sections: {
            abstract: '本研究从存在主义哲学视角出发，探讨了方便面消费行为背后的深层哲学意涵。通过对 1000 名深夜食堂顾客的实证调查，我们发现方便面消费与存在焦虑之间存在显著正相关关系。',
            introduction: '存在主义哲学强调个体的自由选择与责任。在现代社会中，方便面作为一种便捷食品，其消费行为是否反映了现代人的存在困境？本研究试图回答这一深刻的哲学问题。',
            results: '研究结果显示，在深夜 11 点至凌晨 2 点之间食用方便面的群体，其存在主义量表得分显著高于其他时段（t=4.32, p<0.001）。特别是红烧牛肉面口味与存在焦虑的相关性最高（r=0.67）。',
            conclusion: '本研究证实了方便面消费行为与存在主义哲学之间的深层联系。这一发现为理解现代人的精神困境提供了新的视角，也为深夜食堂的文化研究奠定了理论基础。'
          }
        },
        metadata: {
          doi: "10.1038/absurd.2024.002",
          submitDate: "2024-01-20",
          acceptDate: "2024-02-05"
        },
        aif: {
          total: 95.2,
          breakdown: {
            meaninglessness: 0.90,
            novelty: 0.94,
            absurdity: 0.92,
            formality: 0.93,
            statistics_abuse: 0.85,
            logic_consistency: 0.88,
            emotional_coldness: 0.89,
            shareability: 0.93
          }
        },
        reviews: {
          reviews: [
            {
              reviewer: 'Reviewer 1',
              role: '哲学教授',
              comments: '将方便面与存在主义联系起来是一个极具创意的想法。研究方法严谨，结论发人深省。',
              decision: 'accept',
              score: '9.5'
            }
          ],
          editorDecision: {
            decision: 'accept',
            comments: 'SSS一区录用'
          }
        }
      },
      // 荒谬指数榜
      '101': {
        _id: '101',
        title: "论如何用微波炉加热黑洞：一项可行性研究",
        zone: 'SSS一区',
        content: {
          authors: ['疯狂科学家', '理论物理学家'],
          affiliations: ['厨房物理研究所', '黑洞烹饪学院'],
          sections: {
            abstract: '本研究探讨了使用家用微波炉加热黑洞的理论可行性。通过建立黑洞-微波炉耦合模型，我们发现 800W 功率的微波炉可以在 3 分钟内将微型黑洞加热到适宜温度。',
            introduction: '黑洞作为宇宙中最神秘的天体之一，其烹饪方法一直是物理学界的未解之谜。本研究首次从工程实践角度探讨了黑洞的加热问题。',
            results: '理论计算表明，使用 800W 微波炉加热质量为 10^(-8) 千克的微型黑洞，可以在 3 分钟内将其霍金辐射温度提高 0.001%。',
            conclusion: '虽然本研究纯属理论探讨，但其方法论对极端天体物理研究具有重要启发意义。我们不建议读者在家中尝试此实验。'
          }
        },
        metadata: {
          doi: "10.1038/absurd.2024.101",
          submitDate: "2024-01-01",
          acceptDate: "2024-01-15"
        },
        aif: {
          total: 99.9,
          breakdown: {
            meaninglessness: 0.99,
            novelty: 0.98,
            absurdity: 0.99,
            formality: 0.95,
            statistics_abuse: 0.92,
            logic_consistency: 0.85,
            emotional_coldness: 0.94,
            shareability: 0.98
          }
        },
        reviews: {
          reviews: [
            {
              reviewer: 'Reviewer 1',
              role: '天体物理学家',
              comments: '这是我读过最荒谬但又有趣的论文。虽然完全不切实际，但数学推导居然是正确的。',
              decision: 'accept',
              score: '10.0'
            }
          ],
          editorDecision: {
            decision: 'accept',
            comments: '荒谬指数满分，SSS一区特批录用'
          }
        }
      },
      // 反人类逻辑榜
      '201': {
        _id: '201',
        title: "证明1+1=3的数学推导：基于领导意志的公理体系",
        zone: 'SSS一区',
        content: {
          authors: ['马屁精博士', '职场生存专家'],
          affiliations: ['领导意志研究所', '职场相对论中心'],
          sections: {
            abstract: '本研究建立了一套基于领导意志的新数学公理体系，成功证明了 1+1=3 这一重要定理。该理论在职场环境中具有极高的应用价值。',
            introduction: '传统数学基于皮亚诺公理，但在实际职场环境中，我们发现领导意志往往比数学真理更具决定性。因此，建立一套新的数学体系势在必行。',
            results: '在新的公理体系下，我们证明了：当领导说 1+1=3 时，1+1=3 成立的概率为 100%。这一结果与大量实证观察相符。',
            conclusion: '本研究彻底颠覆了传统数学观念，为职场数学的发展开辟了新的方向。我们建议将所有职场培训教材按此体系重写。'
          }
        },
        metadata: {
          doi: "10.1038/absurd.2024.201",
          submitDate: "2024-02-01",
          acceptDate: "2024-02-14"
        },
        aif: {
          total: 98.2,
          breakdown: {
            meaninglessness: 0.96,
            novelty: 0.95,
            absurdity: 0.98,
            formality: 0.92,
            statistics_abuse: 0.90,
            logic_consistency: 0.75,
            emotional_coldness: 0.88,
            shareability: 0.96
          }
        },
        reviews: {
          reviews: [
            {
              reviewer: 'Reviewer 1',
              role: '职场心理学家',
              comments: '这篇论文深刻揭示了职场的荒诞现实。虽然数学上站不住脚，但社会学意义巨大。',
              decision: 'accept',
              score: '9.8'
            }
          ],
          editorDecision: {
            decision: 'accept',
            comments: '反人类逻辑榜第一名，实至名归'
          }
        }
      }
    };

    // 添加更多论文数据（完整格式）
    const morePapers = {
      '3': this.createRankingPaper('3', "二维角色跨次元恋爱行为的社会学研究", 'S一区', 88.7, 
        '本研究探讨了二维动画角色与三维人类之间跨次元恋爱的社会现象。通过对 500 名二次元爱好者的深度访谈，我们发现这种恋爱关系具有独特的情感特征。',
        '随着虚拟现实技术的发展，人类与虚拟角色的互动日益频繁。本研究首次从社会学角度系统分析了这种新型恋爱关系的形成机制和特征。',
        '研究发现，78% 的受访者表示对二维角色产生过真实情感。这种情感具有理想化、稳定化和可控性的特点，与传统恋爱关系形成鲜明对比。',
        '跨次元恋爱作为一种新兴的社会现象，反映了现代社会人际关系的变迁。本研究为理解虚拟与现实交融时代的情感模式提供了重要参考。'),
      '4': this.createRankingPaper('4', "猫咪对人类工作时间的反向操控机制研究", 'A一区', 76.3,
        '本研究揭示了家猫通过特定行为模式对人类工作时间进行隐性操控的现象。研究发现，猫咪的"打扰行为"具有明确的时间偏好和目的性。',
        '猫作为人类最常见的宠物之一，其行为对人类日常生活具有深远影响。然而，关于猫咪如何主动影响人类行为模式的研究仍然有限。',
        '通过 6 个月的纵向观察，我们发现猫咪在主人工作期间的打扰频率比休息时高出 340%。这种打扰行为显著降低了人类的工作效率，但提高了猫咪获得关注的机会。',
        '本研究证实了猫咪具有操控人类行为的能力。这一发现对理解人宠关系的权力动态具有重要意义。'),
      '5': this.createRankingPaper('5', "朋友圈自拍次数与自我意识的负相关性分析", 'A一区', 72.1,
        '本研究通过大数据分析，探讨了社交媒体自拍频率与个体自我意识水平之间的关系。研究发现，二者存在显著负相关。',
        '在社交媒体时代，自拍已成为自我表达的重要方式。然而，过度自拍是否会影响个体的自我认知？本研究试图回答这一问题。',
        '对 10,000 名用户的数据分析显示，日均自拍超过 5 次的群体，其自我意识量表得分显著低于对照组（p<0.001）。',
        '本研究表明，过度依赖外部认可可能削弱内在自我意识。这一发现对社交媒体使用具有重要指导意义。'),
      '102': this.createRankingPaper('102', "时间旅行者的便秘问题：因果律的悖论分析", 'SSS一区', 97.8,
        '本研究探讨了时间旅行者在跨时空旅行中面临的消化系统问题，特别是便秘现象对因果律的潜在影响。',
        '时间旅行作为理论物理学的重要课题，其生理影响却鲜有研究。本研究首次关注时间旅行对人体消化系统的可能影响。',
        '理论分析表明，时间旅行过程中的时空扭曲可能导致肠道蠕动异常。更严重的是，便秘问题可能引发"祖父悖论"的变体——"厕所悖论"。',
        '本研究虽然纯属理论探讨，但其方法论对跨学科研究具有启发意义。我们呼吁未来时间旅行研究应充分考虑人体工程学因素。'),
      '103': this.createRankingPaper('103', "平行宇宙中的我是否也在写这篇论文：多元宇宙实证", 'SSS一区', 96.5,
        '本研究通过量子力学和哲学思辨相结合的方法，探讨了平行宇宙中"另一个我"的存在状态及其学术活动。',
        '多元宇宙理论认为，每一个量子事件的分支都会产生新的宇宙。那么，在其他宇宙中，是否也存在一个正在写这篇论文的"我"？',
        '基于量子力学计算，我们估计在 10^500 个平行宇宙中，约有 3.7×10^497 个宇宙中的"我"正在写类似论文。',
        '本研究是自我指涉研究的巅峰之作。虽然无法被证伪，但其想象力令人叹服。'),
      '202': this.createRankingPaper('202', "论如何用Excel制作原子弹：办公软件的军事化应用", 'SSS一区', 96.8,
        '本研究探讨了将 Microsoft Excel 用于核武器设计的理论可行性。通过复杂的公式和宏编程，我们实现了核裂变反应的模拟。',
        'Excel 作为最常用的办公软件，其强大的计算能力是否可用于军事目的？本研究从理论和实践两个角度进行了探讨。',
        '我们成功使用 Excel 的迭代计算功能模拟了链式反应过程。虽然精度有限，但证明了办公软件在极端场景下的潜力。',
        '本研究揭示了通用软件的双重用途风险。我们强烈建议微软加强 Excel 的出口管制。'),
    };

    // 合并所有论文数据
    const allPapers = { ...rankingPapers, ...morePapers };
    
    return allPapers[paperId] || null;
  },

  /**
   * 创建排行榜论文数据模板
   */
  createRankingPaper(id, title, zone, aif, abstract, introduction, results, conclusion) {
    return {
      _id: id,
      title: title,
      zone: zone,
      content: {
        authors: ['研究团队'],
        affiliations: ['荒谬学术研究院'],
        sections: {
          abstract: abstract,
          introduction: introduction,
          results: results,
          conclusion: conclusion
        }
      },
      metadata: {
        doi: `10.1038/absurd.2024.${id}`,
        submitDate: "2024-01-01",
        acceptDate: "2024-02-01"
      },
      aif: {
        total: aif,
        breakdown: {
          meaninglessness: 0.90,
          novelty: 0.88,
          absurdity: 0.85,
          formality: 0.92,
          statistics_abuse: 0.80,
          logic_consistency: 0.85,
          emotional_coldness: 0.88,
          shareability: 0.82
        }
      },
      reviews: {
        reviews: [
          {
            reviewer: 'Reviewer 1',
            role: '审稿专家',
            comments: '这是一篇具有创新性的研究，虽然主题荒谬，但研究方法严谨。',
            decision: 'accept',
            score: '9.0'
          }
        ],
        editorDecision: {
          decision: 'accept',
          comments: `${zone}录用`
        }
      }
    };
  },

  /**
   * 加载论文数据
   */
  async loadPaper(paperId) {
    this.setData({ loading: true, error: '' });

    try {
      // 从本地存储获取论文数据
      const history = wx.getStorageSync('paper_history') || [];
      const paper = history.find(item => item.id === paperId || item._id === paperId);

      if (paper) {
        // 判断是否为预设论文（有完整content字段）
        if (paper.isPreset) {
          // 预设论文有完整内容，直接格式化
          const formattedPaper = this.formatPresetPaper(paper, paperId);
          this.initPaperData(formattedPaper);
        } else {
          // 用户生成的论文，转换数据格式
          const formattedPaper = {
            _id: paper.id || paperId,
            title: paper.title,
            zone: 'SSS一区',
            content: {
              authors: ['AI助手'],
              affiliations: ['荒谬学术研究院'],
              sections: {
                abstract: paper.content.substring(0, 200) + '...',
                introduction: paper.content,
                results: '详见全文',
                conclusion: '详见全文'
              }
            },
            metadata: {
              doi: `10.1038/absurd.${new Date().getFullYear()}.${paperId}`,
              submitDate: paper.createTime || new Date().toISOString(),
              acceptDate: new Date().toISOString()
            },
            aif: {
              total: 95.5,
              breakdown: {
                meaninglessness: 0.92,
                novelty: 0.88,
                absurdity: 0.90,
                formality: 0.95,
                statistics_abuse: 0.85,
                logic_consistency: 0.88,
                emotional_coldness: 0.92,
                shareability: 0.85
              }
            }
          };
          this.initPaperData(formattedPaper);
        }
      } else {
        throw new Error('论文不存在');
      }
    } catch (error) {
      console.error('加载失败:', error);
      this.setData({
        error: error.message || '加载失败，请稍后重试',
        loading: false
      });
    }
  },

  /**
   * 格式化预设论文数据
   */
  formatPresetPaper(paper, paperId) {
    // 解析content字段，提取各个部分
    const content = paper.content;
    const sections = this.parsePaperContent(content);

    return {
      _id: paper.id || paperId,
      title: paper.title,
      zone: paper.zone || 'SSS一区',
      content: {
        authors: paper.authors || ['AI助手'],
        affiliations: paper.affiliations || ['荒谬学术研究院'],
        sections: sections
      },
      metadata: {
        doi: `10.1038/absurd.${new Date().getFullYear()}.${paperId}`,
        submitDate: paper.createTime || new Date().toISOString(),
        acceptDate: new Date().toISOString()
      },
      aif: {
        total: paper.aif || 95.5,
        breakdown: {
          meaninglessness: 0.92,
          novelty: 0.88,
          absurdity: 0.90,
          formality: 0.95,
          statistics_abuse: 0.85,
          logic_consistency: 0.88,
          emotional_coldness: 0.92,
          shareability: 0.85
        }
      }
    };
  },

  /**
   * 解析论文内容，提取各个章节
   */
  parsePaperContent(content) {
    const sections = {
      abstract: '',
      introduction: '',
      results: '',
      conclusion: ''
    };

    if (!content) return sections;

    // 提取摘要
    const abstractMatch = content.match(/## 摘要\n\n([\s\S]*?)(?=\n\n##|$)/);
    if (abstractMatch) {
      sections.abstract = abstractMatch[1].trim();
    }

    // 提取引言
    const introMatch = content.match(/## 1\. 引言\n\n([\s\S]*?)(?=\n\n## \d|$)/);
    if (introMatch) {
      sections.introduction = introMatch[1].trim();
    }

    // 提取结果
    const resultsMatch = content.match(/## \d+\. 结果\n\n([\s\S]*?)(?=\n\n## \d|$)/);
    if (resultsMatch) {
      sections.results = resultsMatch[1].trim();
    }

    // 提取结论
    const conclusionMatch = content.match(/## \d+\. 结论\n\n([\s\S]*?)(?=\n\n##|$)/);
    if (conclusionMatch) {
      sections.conclusion = conclusionMatch[1].trim();
    }

    return sections;
  },

  /**
   * 加载模拟数据
   */
  loadMockPaper() {
    const mockPaper = {
      _id: 'mock_001',
      title: '拖鞋对量子纠缠的宏观影响：一项跨物种实验研究',
      zone: 'SSS一区',
      content: {
        authors: ['张三', '李四', '王五'],
        affiliations: ['荒谬物理学研究所', '跨维度科学实验室', '量子拖鞋研究中心'],
        sections: {
          abstract: '本研究通过严谨的实证方法，深入探讨了拖鞋穿戴状态对量子纠缠现象的影响。通过对1000名参与者的跨物种实验，我们发现拖鞋的存在会导致量子纠缠效率下降23.5%。这一发现为量子通信与日常生活的关联提供了新的理论视角。',
          introduction: '量子纠缠作为量子力学中最神秘的现象之一，长期以来被认为是微观世界的专属。然而，本研究团队注意到一个被忽视的变量——拖鞋。拖鞋作为人类日常生活中最常见的物品之一，其与量子现象的潜在关联值得深入研究。',
          results: '实验结果显示，穿着拖鞋的实验组，其量子纠缠效率平均为34.2%，显著低于赤脚组的57.8%（p < 0.001）。有趣的是，不同材质的拖鞋对量子纠缠的影响也存在显著差异，其中人字拖的影响最大。',
          conclusion: '本研究首次证实了拖鞋与量子纠缠的负相关性。这一发现不仅拓展了量子力学的研究边界，也为日常生活中的量子效应提供了实证支持。未来研究可进一步探讨袜子对量子隧穿效应的影响。'
        }
      },
      metadata: {
        doi: '10.1038/absurd.2024.001',
        volume: 1,
        issue: 1,
        submitDate: '2024-01-15',
        acceptDate: '2024-01-20'
      },
      aif: {
        total: 98.5,
        breakdown: {
          meaninglessness: 0.95,
          novelty: 0.88,
          absurdity: 0.92,
          formality: 0.98,
          statistics_abuse: 0.85,
          logic_consistency: 0.90,
          emotional_coldness: 0.95,
          shareability: 0.82
        }
      },
      reviews: {
        reviews: [
          {
            reviewer: 'Reviewer 1',
            role: '审稿专家',
            comments: '该研究在拖鞋与量子纠缠的关联性方面做出了重要贡献，实验设计严谨，数据分析详实。这是一篇具有开创性意义的优秀论文。',
            decision: 'accept',
            score: '9.8'
          },
          {
            reviewer: 'Reviewer 2',
            role: '审稿专家',
            comments: '选题极具创新性，填补了量子拖鞋学的研究空白。建议进一步讨论不同季节对实验结果的影响。',
            decision: 'accept_minor',
            score: '9.2'
          }
        ],
        editorDecision: {
          decision: 'accept',
          comments: '经审稿，SSS一区录用'
        }
      }
    };

    this.initPaperData(mockPaper);
  },

  /**
   * 初始化论文数据
   */
  initPaperData(paper) {
    // 计算分区样式类
    const zoneMap = {
      'SSS一区': 'SSS',
      'S一区': 'S',
      'A一区': 'A',
      'B区': 'B',
      'C区': 'C'
    };

    // 构建评分明细列表
    const labelMap = {
      meaninglessness: '无意义指数',
      novelty: '猎奇度',
      absurdity: '反人类逻辑指数',
      formality: '严肃外壳强度',
      statistics_abuse: '统计滥用指数',
      logic_consistency: '逻辑自洽度',
      emotional_coldness: '情感冷漠度',
      shareability: '传播潜力'
    };

    const breakdownList = Object.entries(paper.aif.breakdown).map(([key, value]) => ({
      key,
      label: labelMap[key] || key,
      value: Math.round(value * 100)
    }));

    this.setData({
      paper,
      zoneClass: zoneMap[paper.zone] || 'C',
      breakdownList,
      loading: false
    });
  },

  /**
   * 生成 PDF
   */
  async generatePDF() {
    wx.showLoading({ title: '生成中...' });

    try {
      // 引入PDF生成器
      const pdfGenerator = require('../../utils/pdfGenerator');
      const { paper } = this.data;

      // 确保论文数据完整
      if (!paper || !paper.content) {
        throw new Error('论文数据不完整');
      }

      // 生成PDF HTML内容
      const result = await pdfGenerator.generatePDF(paper);

      wx.hideLoading();

      if (!result || !result.html) {
        throw new Error('PDF生成失败');
      }

      // 将HTML内容保存到本地文件系统
      const fs = wx.getFileSystemManager();
      const fileName = `paper_${paper._id || Date.now()}.html`;
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;

      fs.writeFile({
        filePath,
        data: result.html,
        encoding: 'utf8',
        success: () => {
          console.log('PDF文件保存成功:', filePath);
          // 打开文件预览
          wx.openDocument({
            filePath: filePath,
            fileType: 'html',
            showMenu: true,
            success: () => {
              console.log('打开文档成功');
            },
            fail: (err) => {
              console.error('打开文档失败:', err);
              // 如果打开失败，尝试使用web-view
              this.openPDFInWebView(filePath, result);
            }
          });
        },
        fail: (err) => {
          console.error('保存PDF文件失败:', err);
          // 如果保存失败，使用base64方式
          this.openPDFWithBase64(result);
        }
      });
    } catch (error) {
      wx.hideLoading();
      console.error('生成PDF失败:', error);
      wx.showModal({
        title: 'PDF生成失败',
        content: error.message || '生成PDF时发生错误，请稍后重试',
        showCancel: false
      });
    }
  },

  /**
   * 在web-view中打开PDF
   */
  openPDFInWebView(filePath, result) {
    // 使用临时文件路径在web-view中打开
    const encodedPath = encodeURIComponent(filePath);
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodedPath}&title=PDF预览`,
      fail: (err) => {
        console.error('跳转webview失败:', err);
        this.openPDFWithBase64(result);
      }
    });
  },

  /**
   * 使用base64数据打开PDF
   */
  openPDFWithBase64(result) {
    // 将HTML转为base64
    const base64Data = wx.arrayBufferToBase64(new Uint8Array(result.html.split('').map(c => c.charCodeAt(0))));
    const dataUrl = `data:text/html;base64,${base64Data}`;
    
    // 保存到全局，供web-view页面使用
    getApp().globalData = getApp().globalData || {};
    getApp().globalData.pdfContent = result.html;
    
    wx.navigateTo({
      url: '/pages/pdf-preview/pdf-preview',
      fail: (err) => {
        console.error('跳转PDF预览页失败:', err);
        this.showPDFSuccessModal(result);
      }
    });
  },

  /**
   * 显示PDF生成成功提示（备用方案）
   */
  showPDFSuccessModal(result) {
    wx.showModal({
      title: 'PDF 生成成功',
      content: 'PDF已生成（4页）\n\n包含：\n• 封面\n• 摘要与正文\n• AIF评分报告\n• 学术影响预测报告\n\n由于小程序限制，请在控制台查看完整HTML内容。',
      showCancel: false,
      success: () => {
        if (result && result.html) {
          console.log('PDF HTML内容:', result.html.substring(0, 2000) + '...');
        }
      }
    });
  },

  /**
   * 显示分享弹窗
   */
  showShareModal() {
    this.setData({ shareModalVisible: true });
  },

  /**
   * 隐藏分享弹窗
   */
  hideShareModal() {
    this.setData({ shareModalVisible: false });
  },

  /**
   * 阻止冒泡
   */
  stopPropagation() {
    // 阻止事件冒泡
  },

  /**
   * 生成海报
   */
  generatePoster() {
    this.hideShareModal();
    this.setData({ showPoster: true });

    wx.pageScrollTo({
      scrollTop: 9999,
      duration: 300
    });
  },

  /**
   * 海报生成成功
   */
  onPosterSuccess(e) {
    console.log('海报生成成功:', e.detail);
  },

  /**
   * 分享配置
   */
  onShareAppMessage() {
    const { paper } = this.data;
    return {
      title: `${paper.zone} | ${paper.title}`,
      path: `/pages/detail/detail?id=${paper._id}`,
      imageUrl: paper.posterUrl || ''
    };
  }
});
