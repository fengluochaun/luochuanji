# TeX Inventory

Root: `/Users/feng/项目/blog/research-work/sansa-sam2-fss-html-20260723/source/unpacked`

## Counts

| Item | Count |
| --- | ---: |
| align | 1 |
| equation | 5 |
| figure | 5 |
| figure* | 5 |
| table | 10 |
| table* | 3 |
| tex_files | 22 |

## Section Outline

| Kind | File:line | Text |
| --- | --- | --- |
| section | `sec/1_intro.tex:1` | Introduction |
| section | `sec/2_related.tex:2` | Related works |
| section | `sec/3_method.tex:2` | Method |
| subsection | `sec/3_method.tex:46` | SAM2 Feature Adaptation |
| subsection | `sec/3_method.tex:68` | Training objective |
| section | `sec/4_esperiments.tex:1` | Experiments |
| subsection | `sec/4_esperiments.tex:19` | Strict Few-Shot Segmentation Setting |
| subsection | `sec/4_esperiments.tex:49` | Generalist In-Context Setting |
| subsection | `sec/4_esperiments.tex:62` | Generalization across domains and styles |
| subsection | `sec/4_esperiments.tex:74` | Ablation studies |
| section | `sec/5_conclusions.tex:1` | Conclusions |
| section | `sec/6_supp.tex:3` | Appendix |
| section | `sec/6_supp.tex:24` | Discussion |
| subsection | `sec/6_supp.tex:26` | Limitations and Future Works |
| subsection | `sec/6_supp.tex:30` | Societal Impacts |
| section | `sec/6_supp.tex:38` | Emergence of Semantic Representations |
| subsection | `sec/6_supp.tex:40` | Analyzing Semantic Structure via Principal Component Decomposition |
| subsection | `sec/6_supp.tex:61` | Semantic Discriminability and Downstream Transferability |
| subsection | `sec/6_supp.tex:80` | Extracting Semantics Without Compromising SAM2 Capabilities |
| subsection | `sec/6_supp.tex:98` | Exploring Implicit Semantics in Traditional Video Object Segmentation Methods |
| section | `sec/6_supp.tex:111` | Scalable and Fast Annotation |
| section | `sec/6_supp.tex:124` | Baselines and Ablation Studies |
| subsection | `sec/6_supp.tex:126` | Evaluating the Impact of SAM2 on Prior SAM-Based Pipelines |
| subsection | `sec/6_supp.tex:135` | Experiments with Different Backbones |
| subsection | `sec/6_supp.tex:142` | Effect of the Training Objective |
| section | `sec/6_supp.tex:156` | Additional Datasets and Qualitative Comparison |
| subsection | `sec/6_supp.tex:158` | Qualitative Comparison with Prior Methods |
| subsection | `sec/6_supp.tex:171` | Additional Experiments: Pascal-5$^i$ and COCO $\rightarrow$ Pascal |
| subsection | `sec/6_supp.tex:184` | Promptable Segmentation: Prompt Generation Process and Qualitative Results |
| section | `sec/6_supp.tex:198` | Exploratory Analysis: Negative Prompts |
| subsection | `sec/6_supp.tex:242` | Part Segmentation: Qualitative Results |
| section | `sec/6_supp.tex:253` | Exploring Dependence on Spatial Continuity in SAM2 |
| section | `sec/6_supp.tex:288` | Implementation and Reproducibility |
| subsection | `sec/6_supp.tex:291` | Implementation details |
| subsection | `sec/6_supp.tex:324` | Clarification of Few-Shot Segmentation Evaluation Settings |
| subsection | `sec/6_supp.tex:340` | Datasets |

## Included Graphics

| Kind | File:line | Text |
| --- | --- | --- |
| includegraphics | `figures/feat_analysis_new.tex:3` | images/sam2_miou.pdf |
| includegraphics | `figures/method_fig.tex:3` | images/method.pdf |
| includegraphics | `figures/pca.tex:3` | images/pca.pdf |
| includegraphics | `figures/teaser.tex:5` | images/teaser1.pdf |
| includegraphics | `figures/teaser.tex:12` | images/teaser2.pdf |
| includegraphics | `sec/3_method.tex:93` | images/semantic_correspondence.pdf |
| includegraphics | `sec/4_esperiments.tex:67` | images/wild.pdf |
| includegraphics | `sec/6_supp.tex:163` | images/qualitatives_comparison.pdf |
| includegraphics | `sec/6_supp.tex:192` | images/supp_prompt_compr.pdf |
| includegraphics | `sec/6_supp.tex:247` | images/supp_part_compr.pdf |
| includegraphics | `tables/promptable_seg.tex:6` | images/miou_vs_fps.pdf |
| includegraphics | `tables/promptable_seg.tex:31` | images/promptable.pdf |

## Captions

| Kind | File:line | Text |
| --- | --- | --- |
| caption | `figures/feat_analysis_new.tex:4` | Left: \textbf{Linear probing} for Semantic Segmentation on a fold of COCO-20$^i$, comparing frozen \sam{} and \ours{} (trained on a disjoint class set). Right: \textbf{Few-shot segmentation performance on the same set of data.} Despite poor performance on few-shot segmentation, a simple linear layer (\textit{cf} linear probing) can learn to discriminate semantic-classes from \sam{} frozen features. These results, tog |
| caption | `figures/method_fig.tex:6` | Overview of \textbf{\ours{}}: Given $k$ annotated reference images and a target image, we construct a pseudo-video by concatenating them, then leverage SAM2 streaming pipeline to process reference frames together with their annotations sequentially. We restructure \sam{} feature space to make its latent semantic structure \textit{explicit}, enabling mask propagation based on \textit{semantic similarity} from referenc |
| caption | `figures/pca.tex:4` | \textbf{ Semantic information concentration across principal components.} (a) We evaluate how semantic information is distributed across the principal components of the feature space. For each number of retained components (x-axis), we compute class centroids on COCO-20$^i$ training embeddings and assign test embeddings to the nearest centroid. The y-axis shows the relative classification accuracy, normalized by the  |
| caption | `figures/teaser.tex:6` | We evaluate frozen \sam{} on few-shot segmentation tasks on four datasets with varying degrees of semantic variability. On datasets \cite{candemir2013lung, codella2019skin} with low semantic shift and high intra-class visual similarity, SAM2 matches or even outperforms state-of-the-art APSeg~\cite{he2024apseg}. However, on more challenging datasets like COCO and LVIS, with high semantic shift (\eg, \textit{cruise shi |
| caption | `figures/teaser.tex:14` | We extract \sam{} features from object instances across diverse images and visualize their distribution using the first three principal components of PCA, mapped to RGB channels. The features appear entangled, with clusters mixing across categories, highlighting the lack of a coherent semantic structure in the original feature space. After adapting the feature space with SANSA, well-defined clusters emerge: semantica |
| caption | `figures/teaser.tex:18` | Overall figure caption describing all three images. |
| caption | `sec/3_method.tex:94` | \textbf{Semantic structure of feature space.} (a) PCA visualization of frozen SAM2 and our \ours{} features on a COCO fold with \textit{unseen} classes, showing the first two principal components color-coded by class. SAM2 features exhibit weak semantic separability, indicating entanglement with other signals. (b) PCA-based RGB visualization of \ours{} features across images with \textit{seen} and \textit{unseen} cat |
| caption | `sec/4_esperiments.tex:68` | \textbf{Few-shot segmentation with SANSA in-the-wild}. These examples showcase \ours{} ability to handle alternative types of challenges not typically covered by standard benchmarks, such as domain shifts (\textit{e.g.}, real-world to cartoon) and style variations (\textit{e.g.}, photos to sketches). |
| caption | `sec/6_supp.tex:164` | \textbf{Qualitative comparison on the LVIS-92$^i$ benchmark.} For each example, we show: the annotated reference, the target image, predictions from GF-SAM and SegIC, our SANSA prediction, and the ground truth. The queried class name is shown for clarity, but is not used by any model. |
| caption | `sec/6_supp.tex:194` | \textbf{Qualitative results for one-shot few-shot promptable segmentation.} The figure illustrates segmentation results using different types of prompts. The first row shows examples where the reference object is annotated with a point, the second row uses bounding box annotations, and the third row employs scribble-based annotations. Examples are extracted from COCO-20$^i$. |
| caption | `sec/6_supp.tex:219` | \textbf{Exploratory results with negative prompts on COCO-20$^i$.} Geometric negatives act as test-time corrections. Semantic negatives provide contrastive context. |
| caption | `sec/6_supp.tex:249` | \textbf{Qualitative results for one-shot part segmentation.} Examples from Pascal-Part. |
| caption | `sec/6_supp.tex:270` | \textbf{Spatial coherence across varying continuity conditions.} Lower is better. |
| caption | `sec/6_supp.tex:300` | \textbf{Summary of architecture and training hyperparameters.} |
| caption | `tables/ablation_loss.tex:3` | \textbf{Ablation on training sequence length $J$.} Using $J>1$ improves over the standard few-shot objective ($J=1$). Gains saturate at $J=3$--$4$, which we use as default. |
| caption | `tables/annotation_time.tex:2` | \textbf{Evaluation of large-scale annotation efficiency on COCO-20$^i$ and LVIS-92$^i$ datasets.} We report mIoU and wall-clock annotation time (minutes) required to segment 10,000 target images using reference examples from unseen categories in fold 0. Reference features are precomputed and reused for fair comparison. Experiments conducted on an NVIDIA RTX 4090. \ours{} achieves the best trade-off between accuracy a |
| caption | `tables/complete_ablation.tex:3` | Ablation on COCO-20$^i$. \textbf{Left:} fine-tuning underperforms adaptation. \textbf{Middle:} simple adapters yield strong gains, while higher capacity (larger bottlenecks or added complexity, \textit{e.g.}, MONA) hurts generalization. \textbf{Right:} adapting the last two stages suffices to disentangle semantics. |
| caption | `tables/different_backbones.tex:3` | \textbf{Comparison of model parameters, inference speed (FPS), and mIoU} for different scales of the SAM2 encoder (Tiny, Base, Large) using Hiera. FPS are measured on an NVIDIA RTX 4090. |
| caption | `tables/finetune.tex:3` | \textbf{Comparison of adaptation strategies}. We compare various strategies for adapting SAM2 in terms of generalization to unseen classes (out-of-domain) and performance on seen classes (in-domain). \ours{} achieves the best out-of-domain mIoU with minimal parameter overhead, while preserving the original \sam{} weights. |
| caption | `tables/generalist.tex:3` | \textbf{Performance of \ours{} against Generalist In-context models}. Excluding training-free approaches, all methods are trained on COCO and ADE20k, and we report additional training datasets for each one. SegIC (*) uses additional supervision via a textual meta-prompt at test time. |
| caption | `tables/pascal.tex:3` | \textbf{Evaluation on Pascal-5$^i$ and COCO$\rightarrow$Pascal.} We report the mean Intersection-over-Union (mIoU) for each fold and the average across folds. All methods are evaluated in a strict few-shot setting, including both the standard Pascal-5$^i$ benchmark and the distribution-shift setting (COCO$\rightarrow$Pascal), where models are trained on COCO-20$^i$ and tested on Pascal-5$^i$. $^{\dagger}$ indicates t |
| caption | `tables/promptable_seg.tex:32` | \textbf{Promptable few-shot segmentation with \ours{}.} Top: performance in strict few-shot (COCO-20$^i$) using different prompt types compared with VRP-SAM. Bottom: qualitative examples with point, scribble, and box prompts. |
| caption | `tables/sam_baseline.tex:3` | \textbf{Performance comparison of Segment Anything-based methods replacing SAM with SAM2.} These methods prompt SAM at image-level, hence SAM2 additional capabilities (\eg mask propagation) play no role in this setting. As a result, \sam{} provides only minimal gains for existing two-stage methods (Matcher \cite{liu2023matcher}, GF-SAM \cite{zhang2024bridge}, VRP-SAM \cite{sun2024vrp}). |
| caption | `tables/strict_few_shot.tex:4` | \textbf{Strict Few-Shot Segmentation setting}. Results for $k$-shot segmentation on LVIS-92$^i$, COCO-20$^i$, and FSS-1000. We include both specialist models and approaches based on foundation models, trained and tested on disjoint classes. Training-free methods are also reported for reference. |
| caption | `tables/vos.tex:5` | \textbf{Evaluation of traditional Video Object Segmentation methods and \sam{} with and without SANSA adaptation.} We report mIoU (\ |

## Figure Environments

| Kind | File:line | Text |
| --- | --- | --- |
| figure | `figures/feat_analysis_new.tex:1` | \begin{figure}[h] \centering \includegraphics[width=.7\textwidth]{images/sam2_miou.pdf} \caption{Left: \textbf{Linear probing} for Semantic Segmentation on a fold of COCO-20$^i$, comparing frozen \sam{} and \ours{} (trained on a disjoint class set) |
| figure* | `figures/method_fig.tex:1` | \begin{figure*}[t] \begin{center} \includegraphics[width=\linewidth]{images/method.pdf} \end{center} \vspace{-0.2cm} \caption{Overview of \textbf{\ours{}}: Given $k$ annotated reference images and a target image, we construct a pseudo-video by concatenating th |
| figure | `figures/pca.tex:1` | \begin{figure} \centering \includegraphics[width=.8\textwidth]{images/pca.pdf} \caption{\textbf{ Semantic information concentration across principal components.} (a) We evaluate how semantic information is distributed across the principal component |
| figure* | `figures/teaser.tex:1` | \begin{figure*}[t] \centering \begin{minipage}{0.47\textwidth} \centering \includegraphics[width=\textwidth]{images/teaser1.pdf} \caption{We evaluate frozen \sam{} on few-shot segmentation tasks on four datasets with varying degrees of semantic variabi |
| figure | `sec/3_method.tex:91` | \begin{figure}[t] \centering \includegraphics[width=0.9\linewidth]{images/semantic_correspondence.pdf} \caption{\textbf{Semantic structure of feature space.} (a) PCA visualization of frozen SAM2 and our \ours{} features on a COCO fold with \textit{ |
| figure | `sec/4_esperiments.tex:65` | \begin{figure}[h] \centering \includegraphics[width=0.95\linewidth]{images/wild.pdf} \caption{\textbf{Few-shot segmentation with SANSA in-the-wild}. These examples showcase \ours{} ability to handle alternative types of challenges not typically cov |
| figure | `sec/6_supp.tex:161` | \begin{figure}[h] \centering \includegraphics[width=0.99\linewidth]{images/qualitatives_comparison.pdf} \caption{\textbf{Qualitative comparison on the LVIS-92$^i$ benchmark.} For each example, we show: the annotated reference, the target image, pre |
| figure* | `sec/6_supp.tex:190` | \begin{figure*}[h] \begin{center} \includegraphics[width=\linewidth]{images/supp_prompt_compr.pdf} \end{center} \caption{\textbf{Qualitative results for one-shot few-shot promptable segmentation.} The figure illustrates segmentation results using different typ |
| figure* | `sec/6_supp.tex:245` | \begin{figure*}[h] \begin{center} \includegraphics[width=\linewidth]{images/supp_part_compr.pdf} \end{center} \caption{\textbf{Qualitative results for one-shot part segmentation.} Examples from Pascal-Part.} \label{fig:supp_part} \end{figure*} \section{Explo |
| figure* | `tables/promptable_seg.tex:1` | \begin{figure*}[t] \centering \begin{minipage}{0.47\textwidth} \centering \includegraphics[width=\textwidth]{images/miou_vs_fps.pdf} \vspace{-15pt} \captionof{figure}{\textbf{Comparison of inference speed and mIoU}, with bub |

## Table Environments

| Kind | File:line | Text |
| --- | --- | --- |
| table | `sec/6_supp.tex:217` | \begin{table}[h] \centering \caption{\textbf{Exploratory results with negative prompts on COCO-20$^i$.} Geometric negatives act as test-time corrections. Semantic negatives provide contrastive context.} \vspace{6pt} \begin{tabular}{lc} \toprule Method & mIoU \ |
| table | `sec/6_supp.tex:268` | \begin{table}[h] \centering \caption{\textbf{Spatial coherence across varying continuity conditions.} Lower is better.} \vspace{0.5em} \resizebox{0.8\linewidth}{!}{ \begin{tabular}{lccccc} \toprule \multirow{2}{*}{Setting} & \multicolumn{2}{c}{Continuity} & \m |
| table | `sec/6_supp.tex:298` | \begin{table}[h] \centering \caption{\textbf{Summary of architecture and training hyperparameters.}} \vspace{0.5em} \begin{tabular}{ll} \toprule \textbf{Component} & \textbf{Value / Description} \\ \midrule Base model & SAM2 (frozen) \\ Visual encoder & Hiera- |
| table | `tables/ablation_loss.tex:1` | \begin{table}[h] \centering \caption{\textbf{Ablation on training sequence length $J$.} Using $J>1$ improves over the standard few-shot objective ($J=1$). Gains saturate at $J=3$--$4$, which we use as default.} \vspace{0.5em} \begin{tabular}{lcc} \toprule $J$ |
| table | `tables/annotation_time.tex:1` | \begin{table}[h] \caption{\textbf{Evaluation of large-scale annotation efficiency on COCO-20$^i$ and LVIS-92$^i$ datasets.} We report mIoU and wall-clock annotation time (minutes) required to segment 10,000 target images using reference examples from unseen |
| table | `tables/complete_ablation.tex:1` | \begin{table}[t] \centering \caption{Ablation on COCO-20$^i$. \textbf{Left:} fine-tuning underperforms adaptation. \textbf{Middle:} simple adapters yield strong gains, while higher capacity (larger bottlenecks or added complexity, \textit{e.g.}, MONA) hurts |
| table | `tables/different_backbones.tex:1` | \begin{table}[h] \centering \caption{\textbf{Comparison of model parameters, inference speed (FPS), and mIoU} for different scales of the SAM2 encoder (Tiny, Base, Large) using Hiera. FPS are measured on an NVIDIA RTX 4090.} \vspace{3pt} \begin |
| table | `tables/finetune.tex:1` | \begin{table}[h] \centering \caption{\textbf{Comparison of adaptation strategies}. We compare various strategies for adapting SAM2 in terms of generalization to unseen classes (out-of-domain) and performance on seen classes (in-domain). \ours{} achieves the be |
| table* | `tables/generalist.tex:1` | \begin{table*} \begin{center} \caption{\textbf{Performance of \ours{} against Generalist In-context models}. Excluding training-free approaches, all methods are trained on COCO and ADE20k, and we report additional training datasets for each one. SegIC (*) use |
| table* | `tables/pascal.tex:1` | \begin{table*}[h] \centering \caption{\textbf{Evaluation on Pascal-5$^i$ and COCO$\rightarrow$Pascal.} We report the mean Intersection-over-Union (mIoU) for each fold and the average across folds. All methods are evaluated in a strict few-shot setting, includi |
| table | `tables/sam_baseline.tex:1` | \begin{table}[h] \centering \caption{\textbf{Performance comparison of Segment Anything-based methods replacing SAM with SAM2.} These methods prompt SAM at image-level, hence SAM2 additional capabilities (\eg mask propagation) play no role in this setting. As |
| table* | `tables/strict_few_shot.tex:1` | \begin{table*} \begin{center} \setlength{\tabcolsep}{2pt} \caption{\textbf{Strict Few-Shot Segmentation setting}. Results for $k$-shot segmentation on LVIS-92$^i$, COCO-20$^i$, and FSS-1000. We include both specialist models and approaches based on foundation |
| table | `tables/vos.tex:3` | \begin{table}[h] \begin{center} \caption{\textbf{Evaluation of traditional Video Object Segmentation methods and \sam{} with and without SANSA adaptation.} We report mIoU (\ \vspace{3pt} \resizebox{0.65\linewidth}{!}{ \b |

## Algorithm Environments

| Kind | File:line | Text |
| --- | --- | --- |
|  |  |  |

## Equation/Align Environments

| Kind | File:line | Text |
| --- | --- | --- |
| equation | `sec/3_method.tex:11` | \begin{equation} \mathcal{M} = [x^k_r, a^k_r]^K_{k=1} \cup [x_t, \varnothing], \end{equation} where only the $k$ reference frames are annotated. \subsection{From Object Tracking to Semantic Tracking with \sam{}} \label{sec:preliminaries} Segment Anythi |
| equation | `sec/3_method.tex:26` | \begin{equation} \mathcal{I}_r^k = \mathcal{F}_r^k + \texttt{conv\_down}(\hat{y}_r^k). \label{eq:mem_representation} \end{equation} This representation is stored in the \texttt{Memory Bank}. Subsequently, the features $\mathcal{F}_t$ of target unannota |
| equation | `sec/3_method.tex:31` | \begin{equation} \label{eq:mem_att} \mathcal{F}_{t, \texttt{match}} = \text{Attention} \big( Q(\mathcal{F}_t) K([\mathcal{I}_r^0, ..., \mathcal{I}_r^{k}])^T \big) V([\mathcal{I}_r^0, ..., \mathcal{I}_r^{k}]), \end{equation} where \( \mathcal{I}_r^k \) are past |
| equation | `sec/3_method.tex:55` | \begin{equation} \mathcal{A}(x) = \sigma(x \cdot \mathbf{W}_{down}) \cdot \mathbf{W}_{up}, \end{equation} where $\sigma$ is a ReLu and $\tilde{d} < d$ is the bottleneck dimensionality. The adapted features are summed in a residual fashion in the backbone trans |
| align | `sec/3_method.tex:60` | \begin{align} x_{\text{self}} &= \mathrm{Attention}(x), \\ x' = \mathrm{MLP}&(x_{\text{self}}) + x_{\text{self}} + \mathcal{A}(x_{\text{self}}), \end{align} The backbone weights are kept frozen and we only train projections $\mathbf{W}_{down}$ and $\mathbf{W}_ |
| equation | `sec/3_method.tex:74` | \begin{equation} \mathcal{M}_{train} = [x_r, a_r] \cup [x^j_t, \varnothing]^J_{j=1}, \end{equation} where $\{ x_r, a_r\}$ is the annotated reference image and $\{ x^j_t\}_{j=1}^J$, are the $J$ unlabeled target images. We feed $\mathcal{M}_{train}$ to our mode |
