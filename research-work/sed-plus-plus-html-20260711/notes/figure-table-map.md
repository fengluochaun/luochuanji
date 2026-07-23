Figure / Table Evidence Map

| Item | Source/page | Original caption | What it itself shows | Allowed HTML caption | Nearby callout needed |
| --- | --- | --- | --- | --- | --- |
| Fig.1 | p.2 | Accuracy vs inference time on A-150 and PC-459 | Scatter of open-source methods; SED/SED++ points at 768/384 | A-150 / PC-459 上精度–速度散点对比（单卡 A6000） | 不推广到全部数据集 SOTA |
| Fig.2 | p.4 | Overall architecture of SED | Encoder cost map + GFD (CER/FAM/SFM)×3 + output | SED 整体结构：层次编码器代价图 + 渐进融合解码 | — |
| Fig.3 | p.5 | Structure of GFD | FAM (spa+cls) and SFM skip fusion | 渐进融合解码器：FAM 与 SFM | — |
| Fig.4 | p.6 | Category early rejection | Train aux heads / infer top-k reject | 解码器 CER：训练辅助头，推理 Top-k 剪枝类别 | — |
| Fig.5 | p.6 | Non-label text embedding | “no label” concat to category texts | 非标签文本嵌入示意 | — |
| Fig.6 | p.7 | CER in encoder | Filter cost maps before decoder | 编码器侧 CER | — |
| Fig.7 | p.7 | Modified GFD for video | Temporal aggregation after spa/cls | 视频版解码：时间维聚合 | — |
| Fig.8 | p.13 | Qualitative image results | Selected multi-scene segmentations | 图像开放词汇分割可视化样例 | 为精选成功例，非随机抽样统计 |
| Fig.9 | p.13 | Qualitative video results | Multi-frame VSPW examples | 视频分割可视化样例 | 同上 |
| Fig.10 | p.14 | Non-label prediction | Pred vs GT for unlabeled pixels | “no label” 像素预测可视化 | — |
| Fig.11 | p.14 | Failure cases | Three failure types | 失败案例：相似类 / 细粒度 / 细长物体 | 作者自述局限 |
| Tables I–XIV | p.9–12 | SOTA / speed / ablations | Numeric comparisons (image tables) | 正文用作者叙述中的关键数字；完整表见原文 | 表格为扫描式排版，数字以摘要与正文叙述为准并标明出处 |
