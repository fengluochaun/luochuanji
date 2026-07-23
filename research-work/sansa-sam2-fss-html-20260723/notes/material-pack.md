# Material Pack — SANSA

## Identity

| Field | Value |
| --- | --- |
| Title | SANSA: Unleashing the Hidden Semantics in SAM2 for Few-Shot Segmentation |
| Authors | Claudia Cuttano*, Gabriele Trivigno* (equal contribution), Giuseppe Averta, Carlo Masone |
| Affiliation | Politecnico di Torino |
| Venue | NeurIPS 2025 (arXiv preprint style neurips_2025) |
| arXiv | 2505.21795 |
| Code | https://github.com/ClaudiaCuttano/SANSA |
| Reading basis | MinerU `raw/full.md` + 34 figures; TeX in `source/unpacked/` as secondary check |
| Retrieved | 2026-07-23 |

## One-sentence claim

SAM2 的特征中已隐含可解耦的语义结构；用轻量 AdaptFormer 重塑特征空间、把 few-shot 重铸为「跨图语义追踪」，即可在冻结 SAM2 的前提下达到 SOTA FSS。

## Task formalization

- $k$-shot FSS：参考集 $R=\{(x_r^k,a_r^k)\}_{k=1}^K$，目标 $x_t$，预测与参考语义一致的 mask $y_t$。
- 伪视频：$\mathcal{M}=[x_r^k,a_r^k]_{k=1}^K \cup [x_t,\varnothing]$。

## Core modules

1. **Object tracking → Semantic tracking**：复用 Memory Encoder / Bank / Attention 做跨图密集匹配，Mask Decoder 出高精度 mask。
2. **Feature adaptation**：Image Encoder 最后两 stage 插 AdaptFormer；只训 bottleneck 投影（strict ~10M，generalist ~25M）。
3. **Training objective**：单 reference → 多 target（$J=3$）；中间预测写入 Memory Bank 作 pseudo-reference；BCE + Dice。

## Key numbers (strict 1-shot, Tab.1)

| Benchmark | SANSA | 最强可比对手 | Δ |
| --- | --- | --- | --- |
| LVIS-92$^i$ | 48.8 | SegIC 40.5 | +8.3 |
| COCO-20$^i$ | 60.2 | VRP-SAM 53.9 | +6.3 |
| FSS-1000 | 91.4 | DiffewS 90.2 | +1.2 |

Params：SANSA 234M vs GF-SAM/Matcher 945M；速度约 3×+。

## Public evidence only

- https://arxiv.org/abs/2505.21795
- https://arxiv.org/pdf/2505.21795
- https://github.com/ClaudiaCuttano/SANSA
