# Figure / Table Map

证据边界：caption 只写「图/表本身显示」；更广解释放精读正文 callout。

| ID | 原 caption（论文） | 源 | 图本身显示 | 允许 caption | 更广解释（正文） |
| --- | --- | --- | --- | --- | --- |
| Fig.1 | The motivation of this work… precise binding. | full.md + `a3526aec…jpg` | 三栏：先前稀疏 prompt 的 patch-text 相似度；本文 OD/BD+Semantic Probe 流程；可视化对比（Ours vs ResCLIP） | 动机示意：稀疏 prompt 与本文细粒度绑定、相似度图对比 | 对象绑定失败的两根因：文本稀疏 + 忽略 patch 类间相关 |
| Fig.2 | Overview of the proposed training-free OVCOS framework… | full.md + `17176f7d…jpg` | 端到端流水线：LLaVA→SP→EGTEA→AHPG→SAM | 方法总览：LLaVA 描述、语义探针、EGTEA、AHPG 与 SAM | 模块职责与数据流 |
| Fig.3 | Qualitative comparison on OVCamo… | full.md + `1c178615…jpg` | 多方法 mask 对比；黄/白/红字标真类/正确/错误预测 | OVCamo 定性对比（类别预测着色） | 噪声 mask、漏检与错误分类现象 |
| Fig.4 | Quantitative results of different distance metrics. | full.md + `cb0ca34a…jpg` | 不同距离度量（Spearman / KL / JS 等）柱状/数值对比 | 类相似度度量消融的定量结果 | 为何 rank 相关优于基于绝对值的分布距离 |
| Fig.5 | Visualization of patch-text similarity maps under different semantic probe variants… | full.md + `7cea2174…jpg` | 多种 SP 变体的相似度热图；黄框标绑定偏差 | 语义探针变体下的 patch-text 相似度图 | OD/BD 互补；稀疏 prompt 背景偏置 |
| Fig.6 | Qualitative results under different prompt settings… | full.md + `5c0b2fd8…jpg` | 仅点 / 仅框 / 仅前景相似度等 prompt 设置下的分割 | 不同 prompt 设置的定性分割结果 | AHPG 混合 prompt 的必要性 |
| Fig.7 | Visualization of t-SNE on OVCamo 61 novel classes… | full.md + `08317209…jpg` | 左：原 CLIP 特征 t-SNE；右：EGTEA 后特征 t-SNE | OVCamo 61 novel 类 t-SNE：原 CLIP vs EGTEA | 文本-视觉绑定更紧 |
| Tab.1 | OVCamo 上与 SOTA training-free OVSS/OVCOS 对比 | full.md | 训练/非训练方法多指标表；Ours B/16 与 L/14 | OVCamo 主表：cSm/cF/cMAE/cEm/cIoU | 相对 ResCLIP/CASS 的幅度；与监督方法的差距 |
| Tab.2 | Ablation comparison of proposed components. | full.md | Baseline→+SP→+SAM→+AHPG→+EGTEA；含 Memory/FPS | 组件消融与显存/速度 | 各模块增益与效率 |
| Tab.3 | Ablation analysis of the semantic probe. | full.md | w/o LLaVA、仅 OD/BD 探针 vs Ours | 语义探针消融 | LLaVA OD/BD 与 CamoTemplate 对比 |
| Tab.4 | Ablation analysis of AHPG and EGTEA. | full.md | w/o box/points、AHPG*、CASS、EGTEA* vs Ours | AHPG/EGTEA 消融 | 混合 prompt 与去偏模块贡献 |

图片路径（相对 `notes/`）：`../raw/images/<hash>.jpg`
