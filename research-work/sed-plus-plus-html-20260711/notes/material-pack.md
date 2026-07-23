Material Pack Summary

Metadata:
- Title: SED++: A Simple Encoder-Decoder for Improved Open-Vocabulary Semantic Segmentation
- Authors: Wenqi Zhu, Bin Xie (equal), Jiale Cao (corresponding), Jin Xie, Fahad Shahbaz Khan, Yanwei Pang
- Venue: IEEE TPAMI, Vol. 48, No. 3, March 2026
- DOI: 10.1109/TPAMI.2025.3626757
- Received 29 Mar 2025; revised 18 Sep 2025; accepted 25 Oct 2025; published 31 Oct 2025
- Code: https://github.com/xb534/SED.git
- Weights: https://huggingface.co/WenqiZhu/SEDplus
- Relation: journal extension of CVPR 2024 SED (arXiv:2311.15537 / [70] in paper)

Problem:
- Open-vocabulary semantic segmentation: segment arbitrary text-named categories.
- Prior one-stage VLM methods (MaskCLIP, CAT-Seg) use plain ViT → weak local detail, quadratic cost, forced label assignment, cost scales with #categories.

Core method / modeling:
1) SED = Hierarchical image encoder (CLIP ConvNeXt) + frozen/finetuned text encoder → pixel-level cost map F_cv + Gradual Fusion Decoder (GFD: FAM + SFM) + Category Early Rejection (CER).
2) SED++ adds: non-label text embedding ("no label"); CER also in encoder; temporal-level aggregation for video (minimal decoder change).

Key equations (from paper):
- Cost map cosine similarity (1): F_cv(i,j,n) = (F_t(n)·F_v(i,j)) / (||F_t(n)|| ||F_v(i,j)||)
- F_dec^{l1} = Conv(F_cv) (2)
- FAM spatial then class aggregation with residual (3)(4)
- SFM deconv + concat multi-scale F_j + F_cv, stop-grad to encoder (5-8)
- Aux maps for CER training (9); inference Index=Unique(TopK(M_aux)) (10)(11)

Training recipe (image OVSS):
- Train on COCO-Stuff; eval zero-shot on A-150/A-847, PC-59/PC-459, PAS-20
- 4×A6000, bs=4, AdamW lr=2e-4, wd=1e-4, 80k iters, crop 768
- Image encoder LR scale λ=0.01; D=128 decoder channels
- SED: freeze text, P=80 templates; SED++: FT text QKV, P=1 template
- Fast: input 384; full: 768
- Video: train image COCO without temporal → train decoder temporal on COCO pseudo-video (encoders frozen) → eval VSPW; also VSPW-80 seen → 44 unseen protocol

Headline numbers (from abstract/prose; tables are image-rendered in PDF):
- SED++ ConvNeXt-B: 34.9% mIoU A-150 @ 69 ms (A6000); 20.6% PC-459; 40.2% VSPW
- SED++ ConvNeXt-L video: 44.7% VSPW
- vs CAT-Seg (base): +3.1 mIoU A-150 and 5.6× faster
- SED++-fast base: 35 ms
- vs SED large: +3.2 mIoU and 1.3× faster
- vs Mask-Adapter large: +0.2 mIoU and 5.0× faster
- Video L vs FC-CLIP / OV-DVIS++: +15.8 / +10.6 mIoU; 2.8× / 4.6× faster
- Unseen VSPW: 31.7% (B) vs OV2SS 18.0%; 35.6% (L); 16.1× faster than OV2SS
- Ablation (SED B): baseline 7.3/14.9/23.7 → +HECG 9.9/17.2/28.2 → +GFD 11.2/18.6/31.8 on A-847/PC-459/A-150
- Non-label: +0.6/+0.9/+2.1/+1.3 on PC-459/A-150/PC-59/PAS-20
- Text FT: +1.6 A-847, +0.8 PC-459
- Decoder CER k=8 ≈4.7×; encoder CER k=2
- Temporal 3 frames: 40.5 vs 39.6 (1 frame) on VSPW B

Limitations (author):
- Confuses similar classes (building/house, stairs/floor)
- Weak fine-grained (pillow/towel)
- Fails on slender objects (signboard)
- Future: multi-step reasoning

Evidence-local figure notes:
- Fig.1: speed-accuracy scatter A-150 & PC-459 only — not a claim of SOTA on all datasets.
- Fig.2: SED architecture diagram.
- Fig.3–7: module diagrams (GFD, CER train/infer, non-label, encoder CER, video temporal).
- Fig.8–9: qualitative examples (selected success cases).
- Fig.10: non-label visualization.
- Fig.11: failure cases (author-provided).
