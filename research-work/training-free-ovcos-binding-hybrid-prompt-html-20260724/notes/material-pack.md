# Material Pack

## Meta

| 字段 | 内容 |
| --- | --- |
| 标题 | Training-Free Open-Vocabulary Camouflaged Object Segmentation via Fine-Grained Object Binding and Adaptive Hybrid Prompt |
| 作者 | Peng Ren, Cheng Jiang, Chuande Yang, Fuming Sun, Tian Bai* |
| 单位 | 吉林大学计算机学院 / 符号计算与知识工程教育部重点实验室；大连民族大学信息与通信工程学院 |
| 会议 | CVPR 2026（Open Access） |
| 公开页 | https://openaccess.thecvf.com/content/CVPR2026/html/Ren_Training-Free_Open-Vocabulary_Camouflaged_Object_Segmentation_via_Fine-Grained_Object_Binding_and_CVPR_2026_paper.html |
| PDF | https://openaccess.thecvf.com/content/CVPR2026/papers/Ren_Training-Free_Open-Vocabulary_Camouflaged_Object_Segmentation_via_Fine-Grained_Object_Binding_and_CVPR_2026_paper.pdf |
| arXiv / 代码 | 正文与 openaccess 页未给出独立 arXiv id 或 GitHub 链接 |
| 阅读源 | MinerU `raw/full.md` + 32 张图（正文引用 7 张主图） |
| 检索日 | 2026-07-24 |

## Pipeline（一句话）

LLaVA 生成每图 OD/BD → CLIP 语义探针 + Spearman 排序一致性做 patch 绑定 → EGTEA 熵引导调文本嵌入 → AHPG 产点/框混合 prompt → 冻结 SAM 出 mask。

## 核心符号

- $I$：伪装图像；$T$：类别文本；$C$：类别数；$L$：patch 数；$D$：特征维
- $\mathcal{F}_{patch},\mathcal{F}_{cls},\mathcal{F}_t$：CLIP 视觉 patch / [CLS] / 文本特征
- $SP_t=[\mathcal{F}_t^{od},\mathcal{F}_t^{bd}]$：对象+背景语义探针
- $Sim_{class}$：patch 间类别相似度（Spearman on ranking）
- $S_o^*,S_b^*$：绑定后的对象/背景-文本相似度图
- $A_{anchor},\dot{\mathcal{F}}_t,\mathcal{F}_t^*$：EGTEA 锚点、去偏文本、调整后文本
- $P,B_{final}$：AHPG 点集与扩展框 → SAM

## 主结果（CLIP-ViT-L/14, OVCamo）

| 方法 | cSm↑ | cFβ^ω↑ | cMAE↓ | cFβ↑ | cEm↑ | cIoU↑ |
| --- | --- | --- | --- | --- | --- | --- |
| ResCLIP | 0.326 | 0.156 | 0.508 | 0.178 | 0.346 | 0.144 |
| Ours | **0.502** | **0.418** | **0.379** | **0.450** | **0.543** | **0.371** |
| SuCLIP（监督，对照） | 0.667 | 0.594 | 0.242 | 0.633 | 0.722 | 0.540 |

## 实现要点

- PyTorch；单卡 NVIDIA A40；CLIP-L/14 + SAM ViT-H + LLaVA-1.5-7B 全冻结
- 输入 $336\times336$；$\alpha=\gamma=0.3$；$\tau_m=0.8$；$K^*=[0.1\cdot L]$；框扩展 $\rho=0.1$
- OD/BD 可离线生成；完整配置约 30.2 FPS / 8.26G（Tab.2）
