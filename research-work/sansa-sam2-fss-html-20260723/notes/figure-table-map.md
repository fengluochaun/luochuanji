# Figure / Table Map

路径均相对 `notes/精读笔记.md`。caption 仅写「图本身显示」；更广解释放正文。

| ID | Path | 原 caption 摘要 | 图本身显示 | 笔记用途 |
| --- | --- | --- | --- | --- |
| Fig.1 | `../raw/images/5f4389da3aad5e92eaa4eb9decfd29f9071a957a8a6de8cfd9cdfea8e03e0a7a.jpg` | frozen SAM2 在不同语义偏移数据集上的 FSS 表现 | 四数据集条形/对比 + 低/高语义偏移 mask 示例 | 问题与动机 |
| Fig.2 | `../raw/images/3bc8769aa5abc5a1c893b1b89bf76c2b1846ef08c858a77fa6a92d746c628fd0.jpg` | PCA RGB：SAM2 vs SANSA 特征簇 | 左纠缠、右清晰类簇的 PCA 可视化 | 核心 insight |
| Fig.3 | `../raw/images/9b2a176f5ba80bd8dc54041771e067b1b949db434dfd309184490126ee9909c6.jpg` | SANSA overview：伪视频 + 特征适配 + 传播 | 流水线框图与 PCA 侧栏 | 方法总览 |
| Fig.4a | `../raw/images/664984f2ad4e0c7e4a9dbc12fadd244704fa7393b68b98d2ab12af2e717fd76c.jpg` | 2D/3D PCA | SAM2 vs SANSA 可分性示意 | 特征分析 |
| Fig.4b | `../raw/images/08daa82d7cad1aa647323d3abc83d8284b15c2687bbaa4621a129d12978d358a.jpg` | part-level 聚类匹配 | 跨图部件对齐可视化 | 特征分析 |
| Fig.5 | `../raw/images/6049d913e82127ef5ae3ae7ddaa31079c19a76c6e8e9d6a861459ac63b159b99.jpg` | mIoU vs FPS，气泡=参数量 | SANSA 处于高速高精度区域 | 效率 |
| Fig.6 | `../raw/images/efe1eae4d6d35034fc668c90c8cb88dd25a6668f33264d0e415a031f02df8d12.jpg` | 点/涂鸦/框 promptable 对比 | 表 + 定性示例 | 交互式标注 |
| Fig.7 | `../raw/images/613c2dc21f737ca0786ed841aea811680c042b1c4ef95e0d73b4c6c39175d481.jpg` | in-the-wild 跨域/风格 | 卡通/素描等参考-目标对 | 泛化定性 |
| Fig.10 | `../raw/images/cc846283a80d1ddabb20b3f37284ea53b6f9dce0ad438685c5ef0054aa66664e.jpg` | LVIS 定性 vs GF-SAM / SegIC | 参考、目标、多方法预测与 GT | 实验补充 |

| Table | 内容 | 笔记用途 |
| --- | --- | --- |
| Tab.1 | Strict FSS：LVIS / COCO / FSS-1000 | 主结果 |
| Tab.2 | Generalist in-context + part | 通才设置 |
| Tab.3 | 微调 vs 适配 / 容量 / 插入位置 | 消融 |
