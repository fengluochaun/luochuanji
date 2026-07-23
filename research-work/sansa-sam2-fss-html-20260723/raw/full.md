# SANSA: Unleashing the Hidden Semantics in SAM2 for Few-Shot Segmentation

Claudia Cuttano\* Gabriele Trivigno\* Giuseppe Averta Carlo Masone

Politecnico di Torino
{name.surname}@polito.it

## Abstract

Few-shot segmentation aims to segment unseen categories from just a handful of annotated examples. This requires mechanisms to identify semantically related objects across images and accurately produce masks. We note that Segment Anything 2 (SAM2), with its prompt-and-propagate mechanism, provides strong segmentation capabilities and a built-in feature matching process. However, we show that its representations are entangled with task-specific cues optimized for object tracking, which impairs its use for tasks requiring higher level semantic understanding. Our key insight is that, despite its class-agnostic pretraining, SAM2 already encodes rich semantic structure in its features. We propose SANSA (Semantically AlignNed SegmentAnything 2), a framework that makes this latent structure explicit, and repurposes SAM2 for few-shot segmentation through minimal task-specific modifications. SANSA achieves state-of-the-art on few-shot segmentation benchmarks designed to assess generalization and outperforms generalist methods in the popular in-context setting. Additionally, it supports flexible promptable interaction via points, boxes, or scribbles, and remains significantly faster and more compact than prior approaches. Code at: https://github.com/ClaudiaCuttano/SANSA.

## 1 Introduction

Segmenting images is a core problem in Computer Vision, yet achieving high-quality results typically requires extensive human effort to annotate pixel-level masks. Moreover, conventional semantic segmentation methods $[13, 26, 34, 16]$ struggle to generalize to unseen categories. Inspired by the human ability to recognize novel objects from just a few examples, few-shot segmentation (FSS) $[38, 69, 41, 59]$ has emerged as a paradigm that leverages a small set of labeled reference samples to guide the segmentation of target images containing arbitrary, previously unseen classes.

To this end, recent work has turned to visual foundation models (VFMs) $[7]$ , which offer rich visual representations and strong generalization capabilities $[52, 82]$ . A natural approach $[42, 83, 62]$ is to decouple the few-shot segmentation task into two stages: feature matching followed by promptable segmentation. This is typically achieved by combining DINOv2 $[50]$ , known for its strong semantic correspondence capabilities $[86, 44, 85, 63]$ , with Segment Anything $[35]$ , which excels at producing high-quality segmentation masks $[35, 90, 87]$ . While effective, these modular approaches add computational overhead and require prompt engineering to coordinate multiple VFMs $[89]$ .

We observe that Segment Anything 2 (SAM2) [54] offers an alternative paradigm. Designed for Video Object Segmentation, it operates as a prompt-and-propagate framework, where an object is specified via its mask and tracked across frames. To achieve this, SAM2 introduces a Memory Attention mechanism to implicitly match features across video frames and propagate masks over time with high spatial precision. While this feature matching is originally intended for object tracking based on visual similarity, we note that this architecture inherently unifies two capabilities central to FSS within a single model: dense feature matching and high-quality mask generation. Building on this analogy, we propose repurposing the prompt-and-propagate framework to address the FSS task, by reinterpreting the temporal dimension of videos as a collection of semantically related images.

![](images/5f4389da3aad5e92eaa4eb9decfd29f9071a957a8a6de8cfd9cdfea8e03e0a7a.jpg)

![](images/3bc8769aa5abc5a1c893b1b89bf76c2b1846ef08c858a77fa6a92d746c628fd0.jpg)  
Figure 1: We evaluate frozen SAM2 on few-shot segmentation tasks on four datasets with varying degrees of semantic variability. On datasets [10, 18] with low semantic shift and high intra-class visual similarity, SAM2 matches or even outperforms state-of-the-art APSeg [28]. However, on more challenging datasets like COCO and LVIS, with high semantic shift (e.g., cruise ship vs. rowboat), its performance drops significantly, compared with GF-SAM [83]. The bottom row illustrates examples of ground-truth masks in both scenarios.  
Figure 2: We extract SAM2 features from object instances across diverse images and visualize their distribution using the first three principal components of PCA, mapped to RGB channels. The features appear entangled, with clusters mixing across categories, highlighting the lack of a coherent semantic structure in the original feature space. After adapting the feature space with SANSA, well-defined clusters emerge: semantically similar instances group together, forming coherent structures despite intra-class variation in visual appearance.

This raises the central question: instead of limiting SAM2 to object tracking, can it generalize beyond visual similarity to perform semantic tracking based on shared concepts across images?

Addressing this inquiry means, in turn, to answer whether SAM2 has implicitly learned semantic-aware representations, despite its class agnostic pre-training. To answer this, we conduct a toy experiment in Fig. 1, testing SAM2 performance on FSS datasets with different semantic variability. Interestingly, we observe that in low-semantic-shift scenarios, SAM2 achieves comparable or even higher performance with respect to state-of-the-art methods. However, on challenging datasets with high semantic shift, its performance drops drastically. A straightforward conclusion from these preliminary results would be that SAM2 may not have learned discriminative representations in its class-agnostic pretraining, making it unsuited for tasks requiring semantic alignment.

We challenge this interpretation, based on the observation that SAM2 pretraining, focused on instance matching across frames, shares similarities with self-supervised learning frameworks $[77, 76, 29, 5]$ , which are known to elicit semantic understanding by enforcing feature invariance across views $[11, 4]$ . Given this analogy, we posit that SAM2 does encode semantic information, which is however entangled with instance-specific features optimized for object tracking, reflecting experimental evidence in Fig. 1. If our intuition is true, it implies that i) this structure could be disentangled through lightweight transformations $[1, 32, 37]$ , such as adapter modules and ii) it should be learnable from a set of base classes and generalize to unseen categories $[57, 17]$ . To this end, we i) intentionally use one of the simplest adapters in the literature, namely AdaptFormer $[31]$ , and ii) verify the generalization hypothesis through extensive experiments in strict few-shot benchmarks.

Building on this insight, we introduce SANSA (Semantically AlignNed SegmentAnything 2), and show how to expose SAM2 latent semantic structure, repurposing its Memory Attention mechanism to shift from visual similarity to semantic similarity. The effectiveness of SANSA is illustrated in Fig. 2, where a 3D PCA, computed on unseen classes, reveals the emergent semantic organization of our features. We complement our method with a novel training objective designed to exploit SAM2 temporal continuity to convert each target image into a pseudo-annotation for subsequent frames.

Our contributions are the following:

\- We are the first to investigate the semantic structure within SAM2. We show that such semantics can be disentangled through bottleneck transformations, enabling a unified approach that reinterprets few-shot segmentation as the task of tracking semantic concepts across images;

\- We validate SANSA through extensive experiments, achieving SOTA performance in strict FSS benchmarks while also outperforming generalist approaches in the ‘in-context’ scenario. Our experiments reveal that SAM2 encodes coarse-to-fine semantics, from high level concepts (e.g. dog vs. cat, +6.3% on COCO-20 $^{i}$ ) to fine-grained distinctions at category-level (e.g. dalmatian vs. bulldog, +8.3% on LVIS-92 $^{i}$ ) and part-level (e.g. hand vs. arm +4.6% on Pascal-Part);

\- By supporting prompts like points, boxes, or scribbles, our approach enables a wide range of downstream task, such as data annotation without the need for costly pixel-level masks. Finally, by exploiting the tight integration of memory attention and mask decoding in SAM2, we avoid the need for auxiliary models or complex pipelines, setting a new SOTA with a framework more than 3× faster than competitors, and 4-5× smaller in parameter count.

## 2 Related works

Few-shot segmentation aims to segment a target image given an annotated reference. Early methods relied on compressed prototype representations $[38, 69, 36, 41, 22]$ , later replaced by attention- and correlation-based approaches $[68, 84, 47, 46, 30]$ to better capture pixel-level relationships. More recently, research focused on leveraging the large-scale pretraining and generalization capabilities of vision foundation models $[89, 87, 42, 71, 75]$ . Matcher $[42]$ and GF-SAM $[83]$ utilize a training-free pipeline: DINOv2 extracts correspondences which are used to prompt SAM for segmentation. Similarly, VRP-SAM $[62]$ leverages a frozen SAM with an external encoder for feature matching. Recent works $[87, 89, 44]$ explore the use of a single VFM $[7]$ to jointly handle semantic understanding and mask prediction. DiffewS $[89]$ exploit the emergent semantic correspondences in StableDiffusion $[56]$ to unify the process, while SegIC $[44]$ combines a frozen DINOv2 with a lightweight segmentation decoder. Yet, recent findings $[86, 85]$ suggest that diffusion and DINOv2 features offer complementary but disjoint strengths: the former offers spatial precision but weak semantics, the latter strong semantics but sparse matches. In contrast, we posit that SAM2 unifies both properties: its features possess high spatial granularity and implicitly encode semantic information. We show that this latent semantic structure can be extracted, effectively enabling FSS within a unified architecture.

Semantic correspondences and Foundation Models. Finding correspondences between images is a longstanding problem in Computer Vision $[6, 43, 33, 55, 49]$ . While early deep-learning approaches train dedicated models to establish semantic correspondences $[33, 55]$ , recent works $[86, 63]$ have shown that VFMs enable generalization across tasks $[66, 2, 73, 19]$ . Among them, DINOv2 $[50]$ and StableDiffusion $[56]$ have demonstrated a compelling ability to establish semantic correspondences between images $[86, 49, 85]$ . Recently, Segment Anything 2 $[54]$ established itself as a foundation model for Video Object Segmentation. We observe that its pretraining, entailing matching object instances across frames under viewpoint changes and motion blur, closely parallels self-supervised learning frameworks $[77, 76, 29]$ that derive semantic understanding through self-similarity training. However, the extent to which SAM2 embeddings encode (if any) semantic concepts has not been studied yet. Recent applications in specialized domains $[91, 3]$ utilize a frozen SAM2 in low-semantic-shift scenarios (e.g. propagating masks across slices of 3D imagery given a support example). However, frozen SAM2 shows poor performance in standard FSS benchmarks requiring higher level semantic understanding. In this work, we shed light on this matter, providing insights into SAM2 feature structure and showing that semantic content can be disentanged from its embeddings.

## 3 Method

We structure our investigation around the following key research questions: (1) Can semantic information be effectively extracted from SAM2 features? (2) Can this extraction occur without impairing the functionality of the SAM2 decoder, thereby maintaining its precise segmentation performance? (3) Finally, if a mapping that enhances semantic structure within SAM2 features can be learned, does this mapping generalize effectively to unseen classes?

![](images/9b2a176f5ba80bd8dc54041771e067b1b949db434dfd309184490126ee9909c6.jpg)  
Figure 3: Overview of SANSA: Given k annotated reference images and a target image, we construct a pseudo-video by concatenating them, then leverage SAM2 streaming pipeline to process reference frames together with their annotations sequentially. We restructure SAM2 feature space to make its latent semantic structure explicit, enabling mask propagation based on semantic similarity from reference to target. The emergent semantic structure is visualized by the 3D PCA projection of F.

These questions directly shape the design of our approach. Throughout the rest of the manuscript, we provide empirical evidence supporting affirmative answers to each.

Task Definition. We consider the general $k$ -shot segmentation setting, where the model is given $K$ reference pairs $R = (x_r^k, a_r^k)_{k=1}^K$ , each consisting of an image $x_r^k \in \mathbb{R}^{H \times W \times 3}$ and its mask annotation $a_r^k \in [0,1]^{H \times W}$ . Given a target image $x_t \in \mathbb{R}^{H \times W \times 3}$ , the goal is to predict $y_t \in [0,1]^{H \times W}$ , the segmentation mask of objects in $x_t$ that are semantically aligned with the reference. As shown in Fig. 3, we interpret the references and the target as a sequence of frames in a pseudo-video $\mathcal{M}$ :

$$
\mathcal {M} = [ x _ {r} ^ {k}, a _ {r} ^ {k} ] _ {k = 1} ^ {K} \cup [ x _ {t}, \emptyset ],\tag{1}
$$

where only the k reference frames are annotated.

## 3.1 From Object Tracking to Semantic Tracking with SAM2

Segment Anything Model 2 extends SAM [35] to Promptable Video Object Segmentation. Like its predecessor, SAM2 comprises three main elements: an Image Encoder, a Prompt Encoder, and a Mask Decoder. Specifically, given an image $x_r^k$ with features $\mathcal{F}_r^k$ , and a prompt $a_r^k \in \{\text{mask}, \text{point}, \text{box}\}$ , the Mask Decoder processes them to produce the segmentation mask $\hat{y}_r^k$ . The key innovation of SAM2 lies in its extension to video domain: masks can be propagated across new unannotated frames $x_t$ without additional prompts, thanks to a memory mechanism. As shown in Fig. 3, we conceptually decompose SAM2 architecture into two functional components:

\- Dense Feature Matching: Comprising the Memory Encoder, Memory Bank, and Memory Attention, this module establishes dense correspondences across frames. Concretely, given an object reference mask $\hat{y}_r^k$ (either predicted or given as prompt), the Memory Encoder constructs its memory representation, by fusing the mask with frame features $\mathcal{F}_r^k$ :

$$
\mathcal {I} _ {r} ^ {k} = \mathcal {F} _ {r} ^ {k} + \text { conv\_down } (\hat {y} _ {r} ^ {k}).\tag{2}
$$

This representation is stored in the Memory Bank. Subsequently, the features $F_{t}$ of target unannotated frames undergo a cross-attention (Memory Attention) that aims at establishing dense correspondences between the current frame and the memory representations from previous frames:

$$
\mathcal {F} _ {t, \text { match }} = \text { Attention } \big (Q (\mathcal {F} _ {t}) K ([ \mathcal {I} _ {r} ^ {0},..., \mathcal {I} _ {r} ^ {k} ]) ^ {T} \big) V ([ \mathcal {I} _ {r} ^ {0},..., \mathcal {I} _ {r} ^ {k} ]),\tag{3}
$$

where $I_{r}^{k}$ are past representations and $Q(\cdot)$ , $K(\cdot)$ , $V(\cdot)$ the query, key, and value projections.

\- High-quality Mask Generation: For unannotated frames, the Mask Decoder is tasked with refining the coarse features matches $\mathcal{F}_{t,\text{match}}$ , which encode dense correspondences with prior object representations, to produce the segmentation output $\hat{y}_t$ (cf Fig. 3).

We propose to repurpose the memory-based feature matching and mask decoding mechanisms, reinterpreting the temporal dimension of videos as a collection of semantically related images. Thus, rather than tracking a specific object across continuous frames, we aim at tracking its semantic class.

We highlight two advantages of this formulation: first, unlike recent approaches $[62, 44, 89]$ , our model naturally supports variable k-shots without modifications; second, our solution seamlessly supports promptable FSS, where prompts can take the form $a_{r}^{k} \in \{mask, point, box, scribble\}$ , removing the reliance on pixel-level annotations. Finally, we note that reference frames are encoded in Memory Bank without undergoing Memory Attention (cf Fig. 3). By avoiding cross-referencing, we ensure predictions for the target image to be invariant to the ordering of reference images.

## 3.2 SAM2 Feature Adaptation

At the core of the feature matching mechanism lie the learned feature representations, central to the Memory Attention mechanism: the reference object representation $I_{r}$ is constructed from $F_{r}$ (Eq. (2)), and matching is performed via cross-attention between target features $F_{t}$ and $I_{r}$ (Eq. (3)).

Our goal is repurposing the Memory Attention to shift from instance-level to semantic-level matching. To achieve this, we introduce minimal architectural changes and instead focus on restructuring the feature space itself. Specifically, we seek to induce a semantic organization of the features, enabling dense correspondences to reflect semantic similarity rather than visual-similarity.

We hypothesize that SAM2 features already encode semantic concepts, albeit entangled with signals specific to tracking, such as instance-level details and spatial biases. If such structure exists, then it should be learnable from a set of base classes by training few parameters $[1, 32, 57]$ . Thus, we opt for simple AdaptFormer $[14]$ blocks, although our analysis is not tied to the adaptation method, as we will show in the Experimental Section. We integrate AdaptFormer blocks within the last two layers of the Image Encoder, as these encode higher-level semantic representations. Given down- and up-projection matrices $W_{down} \in R^{d,\tilde{d}}$ , $W_{up} \in R^{\tilde{d},d}$ , an AdaptFormer block operates token-wise:

$$
\mathcal {A} (x) = \sigma (x \cdot \mathbf {W} _ {d o w n}) \cdot \mathbf {W} _ {u p},\tag{4}
$$

where $\sigma$ is a ReLu and $\tilde{d} < d$ is the bottleneck dimensionality. The adapted features are summed in a residual fashion in the backbone transformer blocks:

$$
x _ {\text { self }} = \text { Attention } (x),\tag{5}
$$

$$
x ^ {\prime} = \operatorname{MLP} (x _ {\text { self }}) + x _ {\text { self }} + \mathcal {A} (x _ {\text { self }}),\tag{6}
$$

The backbone weights are kept frozen and we only train projections $W_{down}$ and $W_{up}$ .

## 3.3 Training objective

Following standard practice in FSS, we adopt an episodic training paradigm [67, 59, 69, 36]. We have access to a set of training episodes, each one containing annotated instances from a single class. We denote these episodes as $\{x^i, y^i\}$ , where $y^i \in [0,1]^{H \times W}$ is the mask that segments these instances.

Leveraging our model inherent ability to process sequences of variable length, we create challenging training examples by inverting the standard k-shot setup: instead of predicting a single target image from multiple references, the model receives a single labeled reference image and is tasked with propagating the concept to multiple unlabeled target images. Formally, we define the training clip:

$$
\mathcal {M} _ {\text { train }} = [ x _ {r}, a _ {r} ] \cup [ x _ {t} ^ {j}, \emptyset ] _ {j = 1} ^ {J},\tag{7}
$$

where $\{x_{r}, a_{r}\}$ is the annotated reference image and $\{x_{t}^{j}\}_{j=1}^{J}$ , are the J unlabeled target images. We feed $M_{train}$ to our model, which propagates the provided concept across target frames to predict the masklet $\{\hat{y}_{t}^{j}\}_{j=1}^{J}$ . Initially, the Memory Bank is populated with the reference representation $I_{r}$ . We propose to condition the prediction for each target frame on the reference as well as on previous target predictions, by encoding in the Memory Bank the predicted representation $I_{t}^{j}$ , computed as in Eq. (2). This design transforms each intermediate frame into a pseudo-reference for subsequent frames. This objective discourages overfitting to individual image pairs and encourages robust, semantically grounded correspondences, forcing the model to disentangle semantics from low-level features. We supervise the predicted $\{\hat{y}_{t}^{j}\}_{j=1}^{J}$ with a Binary Cross-Entropy loss and a Dice loss [45].

![](images/664984f2ad4e0c7e4a9dbc12fadd244704fa7393b68b98d2ab12af2e717fd76c.jpg)  
b. 3D PCA visualizations

a. 2D PCA visualizations  
![](images/08daa82d7cad1aa647323d3abc83d8284b15c2687bbaa4621a129d12978d358a.jpg)  
c. Clustering & Match visualizations  
Figure 4: Semantic structure of feature space. (a) PCA visualization of frozen SAM2 and our SANSA features on a COCO fold with unseen classes, showing the first two principal components color-coded by class. SAM2 features exhibit weak semantic separability, indicating entanglement with other signals. (b) PCA-based RGB visualization of SANSA features across images with seen and unseen categories, showing consistent semantic mapping. (c) Part-level semantics and cross-image consistency. We cluster features per object and match clusters across image pairs via Hungarian Matching. This reveals that SANSA captures fine-grained distinctions (e.g., handlebar vs. wheel), spatial layout (e.g., upper vs. lower wheel), and produces representations that align across images.

## 3.4 Visualizing SANSA Feature Space

In this section we analyze how adaptation reshapes SAM2 feature space. In Fig. 4a, we extract features for SAM2 and SANSA for a set of objects belonging to unseen classes for our trained model, and visualize their first two Principal Components (PCs), labeled by class. Frozen SAM2 features show weak class discriminability, reinforcing the hypothesis that semantic structure is entangled with task-specific features tailored for the original tracking objective, explaining SAM2 poor FSS performance. Consequently, the leading PCs reveal a mix of semantic and non-semantic signals. In contrast, our SANSA features show clear semantic discriminability, mapping novel classes into well-defined semantic clusters. In Fig. 4b, we visualize SANSA features using PCA, computed jointly across images, where the first three PCs are mapped to RGB channels. The visualization spans three images containing instances from both unseen (e.g., person, chair, ball) and seen (e.g., umbrella) categories. The consistent color mapping across instances of the same category highlights strong semantic grouping, mapping similar concepts coherently in feature space despite visual variability.

Finally, in Fig. 4c, we shift from coarse category level to fine-grained correspondences at the part level. Following [86], we cluster object features with K-Means and match centroids across image pairs via the Hungarian Algorithm, then visualize matched clusters with shared colors to assess semantic consistency. The results show that, despite not being trained with part-level supervision, SANSA features encode part-level understanding (e.g. hand vs arm, handlebar vs wheel), spatial layout (e.g. upper vs lower wheel), and produce representations that align across images.

We provide an in-depth study of semantic representations in Appendix B, using PCA, clustering, and linear probing to analyze how semantics are encoded in SAM2 and made explicit through adaptation.

Table 1: Strict Few-Shot Segmentation setting. Results for k-shot segmentation on LVIS-92 $^{i}$ , COCO-20 $^{i}$ , and FSS-1000. We include both specialist models and approaches based on foundation models, trained and tested on disjoint classes. Training-free methods are also reported for reference.

<table><tr><td rowspan="3">Method</td><td rowspan="3">Venue</td><td rowspan="3">Backbone</td><td rowspan="3">Params</td><td colspan="6">few-shot segmentation</td></tr><tr><td colspan="2">LVIS-92 $^{i}$ </td><td colspan="2">COCO-20 $^{i}$ </td><td colspan="2">FSS-1000</td></tr><tr><td>1-shot</td><td>5-shot</td><td>1-shot</td><td>5-shot</td><td>1-shot</td><td>5-shot</td></tr><tr><td colspan="10">Training-free methods</td></tr><tr><td>SAM 2 [54]</td><td>-</td><td>SAM2-L</td><td>224 M</td><td>16.5</td><td>26.3</td><td>32.2</td><td>44.2</td><td>73.0</td><td>84.3</td></tr><tr><td>PerSAM [87]</td><td>ICLR&#x27;24</td><td>SAM-H</td><td>641 M</td><td>11.5</td><td>-</td><td>23.0</td><td>-</td><td>71.2</td><td>-</td></tr><tr><td>Matcher [42]</td><td>ICLR&#x27;24</td><td>DINOv2-L+SAM-H</td><td>945 M</td><td>33.0</td><td>40.0</td><td>52.7</td><td>60.7</td><td>87.0</td><td>89.6</td></tr><tr><td>GF-SAM [83]</td><td>NeurIPS&#x27;24</td><td>DINOv2-L+SAM-H</td><td>945 M</td><td>35.2</td><td>44.2</td><td>58.7</td><td>66.8</td><td>88.0</td><td>88.9</td></tr><tr><td colspan="10">Strict k-shot segmentation</td></tr><tr><td>AMFormer [72]</td><td>NeurIPS&#x27;23</td><td>ResNet101</td><td>49 M</td><td>-</td><td>-</td><td>51.0</td><td>57.3</td><td>-</td><td>-</td></tr><tr><td>HMNet [75]</td><td>NeurIPS&#x27;24</td><td>RN50</td><td>39 M</td><td>-</td><td>-</td><td>52.1</td><td>58.9</td><td>-</td><td>-</td></tr><tr><td>VRP-SAM [62]</td><td>CVPR&#x27;24</td><td>RN50 + SAM-H</td><td>670 M</td><td>28.3</td><td>-</td><td>53.9</td><td>-</td><td>87.7</td><td>-</td></tr><tr><td>SegIC [44]</td><td>ECCV&#x27;24</td><td>DINOv2-G</td><td>1.2 B</td><td>40.5</td><td>-</td><td>53.6</td><td>-</td><td>88.5</td><td>-</td></tr><tr><td>DiffewS [89]</td><td>NeurIPS&#x27;24</td><td>StableDiffusion</td><td>890 M</td><td>33.9</td><td>43.7</td><td>52.2</td><td>60.7</td><td>90.2</td><td>90.6</td></tr><tr><td>SANSA</td><td>NeurIPS&#x27;25</td><td>SAM2-L</td><td>234 M</td><td>48.8</td><td>53.9</td><td>60.2</td><td>64.3</td><td>91.4</td><td>92.1</td></tr></table>

## 4 Experiments

Implementation details. We employ SAM2 with Hiera-Large $[58]$ as encoder. AdaptFormer $[14]$ is inserted into the last two blocks, with hidden size set to $0.3\times$ the block channel dimension in the strict few-shot setting and $0.8\times$ in the generalist. SAM2 is frozen, and only the adapters are trained ( $\sim10M$ params in the strict case and $\sim25M$ in the generalist). We train with AdamW and learning rate $10^{-4}$ for 5 epochs (strict) and 20 (generalist), with k=1 (a single annotated reference) and sequence length J=3. The same model is evaluated on 1-shot and 5-shot. Full details are in Appendix H.

Datasets. COCO-20 $^{i}$ [48] is built on MSCOCO [39] and consists of 80 classes split into four folds, each with 20 classes. FSS-1000 [23] contains 1000 classes, with 520 for training, 240 for validation, and 240 for testing. LVIS-92 $^{i}$ [42] is more challenging, selecting 920 classes from LVIS [24], divided in 10 folds. PASCAL-Part [42] includes four superclasses with 56 object parts across 15 classes. PACO-Part is built from PACO [53] and contains 303 classes, split in four folds.

## 4.1 Strict Few-Shot Segmentation Setting

We first evaluate our method in strict FSS setting. Following standard protocols $[72, 62, 61]$ , we train on base classes and evaluate on novel classes with k-shots. These experiment address the question of whether the semantic mapping learned on base classes can transfer meaningfully to novel categories.

Few-shot segmentation. In Tab. 1, we compare SANSA, besides specialist models, such as AMFormer [72] and HMNet [75], with the most relevant and recent approaches based on Foundation Models. These include methods that, like ours, leverage a single Foundation Model, such as SegIC [44] and DiffewS [89], as well as modular two-stage pipelines like VRP-SAM [62]. For completeness, we also report results from generalist training-free methods built on DINOv2 and SAM, including PerSAM [87], Matcher [42], GF-SAM [83], as well as our baseline, i.e. frozen SAM2.

In the one-shot setting, SANSA consistently outperforms all prior methods, demonstrating superior generalization to unseen classes. Specifically, we surpass the best direct competitors SegIC, VRPSAM and DiffwS by +8.3%, +6.3%, and +1.2% on LVIS-92 $^{i}$ , COCO-20 $^{i}$ , and FSS-1000, respectively. This performance gap remains consistent also against training-free approaches: compared to GF-SAM, SANSA achieves gains of +13.6%, +1.5%, and +3.4%. On the challenging LVIS-92 $^{i}$ , including 920 fine-grained categories (e.g., bulldog, dalmatian), DINO-based methods (SegIC, GF-SAM, Matcher) tend to underperform, possibly due to DINO overly-semantic features [20, 86] (e.g., grouping distinct breeds under the concept of “dog”). Here, SANSA achieves a substantial +8.3% gain, suggesting that SAM2 encodes a latent hierarchical semantic structure, capturing both high-level semantic concepts (dominant in COCO-20 $^{i}$ ) and fine-grained distinctions (crucial for LVIS-92 $^{i}$ ).

![](images/6049d913e82127ef5ae3ae7ddaa31079c19a76c6e8e9d6a861459ac63b159b99.jpg)  
Figure 5: Comparison of inference speed and mIoU, with bubble size representing #parameters. The plot highlights our superior trade-off.

<table><tr><td></td><td>VRP-SAM</td><td colspan="2">SANSA(ours)</td></tr><tr><td>Params</td><td>670M</td><td>234M</td><td></td></tr><tr><td>point</td><td>38.4</td><td>53.4</td><td>+15.0</td></tr><tr><td>scribble</td><td>47.3</td><td>53.1</td><td>+5.8</td></tr><tr><td>box</td><td>49.7</td><td>54.3</td><td>+4.6</td></tr><tr><td>mask</td><td>53.9</td><td>60.2</td><td>+6.3</td></tr></table>

![](images/efe1eae4d6d35034fc668c90c8cb88dd25a6668f33264d0e415a031f02df8d12.jpg)  
Figure 6: Promptable few-shot segmentation with SANSA. Top: performance in strict few-shot (COCO-20 $^{4}$ ) using different prompt types compared with VRP-SAM. Bottom: qualitative examples with point, scribble, and box prompts.

Regarding the 5-shot setting, we note that SegIC and VRP-SAM do not provide an inference pipeline to extend to k-shot. In contrast, SANSA natively models correspondences across multiple reference frames and it outperforms the best competitor, DiffewS, by +10.2% and +3.6% on LVIS-92 $^{i}$ and COCO-20 $^{i}$ , respectively. Compared to training-free models, SANSA shows improvements of +9.7%, +3.2%, on LVIS-92 $^{i}$ and FSS-1000, while suffering a -2.5% gap on COCO-20 $^{i}$ w.r.t. GF-SAM. We also report results of upgrading SAM-based baselines to SAM2 in Appendix D.

Performance-Efficiency Trade-off. In Fig. 5, we analyze the trade-off between model size, inference speed (img/s), and performance. SANSA achieves state-of-the-art results while being the most lightweight solution. Specifically, it is: i) over 3× faster than the direct competing method (GF-SAM), ii) more compact, introducing only adapter parameters on top of SAM2 (totaling 234M), and iii) substantially more accurate, outperforming GF-SAM by +13.6% mIoU on the challenging LVIS-92 $^{i}$ benchmark. Importantly, SANSA keeps the SAM2 architecture entirely frozen, meaning that by storing only the adapter weights, it retains SAM2 state-of-the-art performance on Video Object Segmentation while also achieving top-tier results on few-shot segmentation within a single model. A large-scale annotation study quantifying speed/quality trade-offs is presented in Appendix C.

One-Shot Promptable Segmentation. Our framework keeps SAM2 decoder frozen, maintaining its capability to generate masks from any prompt (i.e. points, scribbles, or boxes). As such, during inference, users can segment reference objects by providing a simple point, without requiring costly pixel-level masks. In Fig. 6 we evaluate the performance with different prompts on strict FSS setting on COCO- $20^{i}$ against VRP-SAM, which also supports such prompts. SANSA shows gains of +15.0%, +4.6%, and +5.8% when using points, scribbles, and boxes as annotations. More importantly, the performance drop from masks to point prompts is substantially smaller for SANSA (-6.8%) compared to VRP-SAM (-15.5%). We attribute this to the tightly coupled design of our architecture, which maximizes feature reuse by jointly leveraging the same representations for prompt encoding, feature matching, and mask decoding. Prompt generation details and qualitative results are in Appendix E.

## 4.2 Generalist In-Context Setting

Following recent few-shot segmentation works $[44, 89, 42, 83]$ , we evaluate SANSA in the in-context segmentation setting, where a single generalist model is tested across multiple benchmarks (cf. Tab. 2). Given the lack of a standardized training protocol, we explicitly report additional datasets used by each method beyond ADE20K and COCO, which are shared across all approaches. We evaluate three configurations of our approach: i) a minimal setup using only COCO and ADE20K, ii) an extended version incorporating LVIS, following the setup of SegIC $[44]$ , and iii) a variant including PACO to mitigate object-level bias and reinforce part segmentation capabilities.

When trained only on COCO and ADE20K coarse categories, SANSA exhibits strong out-of-domain generalization on the LVIS benchmark, outperforming DiffewS and SINE by +4.8% and +5.0%, respectively. Moreover, when LVIS is included in the training set (matching SegIC in-domain setup), SANSA further improves performance and surpasses SegIC by +5.4%. Despite not being trained at the part level, SANSA exhibits strong cross-task generalization capabilities, surpassing generalist baselines by a large margin (+7.5% and +8.4% over DiffewS, the best competitor on Pascal-Part and Paco-Part, respectively), including those trained on part segmentation datasets $[71, 40]$ . Our method is only outperformed by training-free models, which, by design, are not biased by object-level training. To address this bias, we follow $[71, 40]$ and augment our training set with PACO, leading to +6.7% on Paco-Part (in-domain) and +4.6% on Pascal-Part (out-of-domain) against the strong baseline of GF-SAM. Finally, we highlight that, within the generalist model category, SANSA is the most compact solution, with only 250 M parameters.

Table 2: Performance of SANSA against Generalist In-context models. Excluding training-free approaches, all methods are trained on COCO and ADE20k, and we report additional training datasets for each one. SegIC (\*) uses additional supervision via a textual meta-prompt at test time.

<table><tr><td rowspan="3">Method</td><td rowspan="3">Additional Datasets</td><td rowspan="3">Params</td><td colspan="6">few-shot segmentation</td><td colspan="2">part seg.</td></tr><tr><td colspan="2"> $LVIS-92^i$ </td><td colspan="2"> $COCO-20^i$ </td><td colspan="2">FSS-1000</td><td rowspan="2">Pascal Part</td><td rowspan="2">PACO Part</td></tr><tr><td>1-shot</td><td>5-shot</td><td>1-shot</td><td>5-shot</td><td>1-shot</td><td>5-shot</td></tr><tr><td colspan="11">Training-free methods</td></tr><tr><td>Matcher [42]</td><td>n.a.</td><td>945M</td><td>33.0</td><td>40.0</td><td>52.7</td><td>60.7</td><td>87.0</td><td>89.6</td><td>42.9</td><td>34.7</td></tr><tr><td>GF-SAM [83]</td><td>n.a.</td><td>945M</td><td>35.2</td><td>44.2</td><td>58.7</td><td>66.8</td><td>88.0</td><td>88.9</td><td>44.5</td><td>36.3</td></tr><tr><td>Painter [70]</td><td>NYUv2</td><td>354 M</td><td>10.5</td><td>10.9</td><td>33.1</td><td>32.6</td><td>61.7</td><td>62.3</td><td>30.4</td><td>14.1</td></tr><tr><td>SegGPT [71]</td><td>Pascal, PACO</td><td>354 M</td><td>18.6</td><td>25.4</td><td>56.1</td><td>67.9</td><td>85.6</td><td>89.3</td><td>35.8</td><td>13.5</td></tr><tr><td>SINE [40]</td><td>Object365, PACO</td><td>373 M</td><td>31.2</td><td>35.5</td><td>64.5</td><td>66.1</td><td>-</td><td>-</td><td>36.2</td><td>-</td></tr><tr><td>DiffewS [89]</td><td>Pascal</td><td>890 M</td><td>31.4</td><td>35.4</td><td>71.3</td><td>72.2</td><td>87.8</td><td>88.0</td><td>34.0</td><td>22.8</td></tr><tr><td>SegIC [44]</td><td>LVIS</td><td>1.2 B</td><td>47.8</td><td>-</td><td>74.5*</td><td>-</td><td>88.4</td><td>-</td><td>31.2</td><td>18.7</td></tr><tr><td>SANSA</td><td>-</td><td>250 M</td><td>36.2</td><td>42.5</td><td>76.4</td><td>77.1</td><td>88.2</td><td>89.0</td><td>40.4</td><td>29.2</td></tr><tr><td>SANSA</td><td>LVIS</td><td>250 M</td><td>53.2</td><td>58.1</td><td>74.7</td><td>76.3</td><td>89.1</td><td>89.7</td><td>41.5</td><td>31.2</td></tr><tr><td>SANSA</td><td>LVIS, PACO</td><td>250 M</td><td>50.3</td><td>59.0</td><td>75.6</td><td>78.6</td><td>90.0</td><td>91.0</td><td>49.1</td><td>43.0</td></tr></table>

## 4.3 Generalization across domains and styles

To explore how SANSA generalizes beyond the scope of standard benchmarks, we follow $[62, 42]$ and present qualitative examples drawn from in-the-wild image pairs, shown in Fig. 7. In each case, the model is tasked with few-shot segmentation using a reference image from COCO $[39]$ and a target image collected from the web, offering a complementary view to benchmark evaluations.

![](images/613c2dc21f737ca0786ed841aea811680c042b1c4ef95e0d73b4c6c39175d481.jpg)  
Figure 7: Few-shot segmentation with SANSA in-the-wild. These examples showcase SANSA ability to handle alternative types of challenges not typically covered by standard benchmarks, such as domain shifts (e.g., real-world to cartoon) and style variations (e.g., photos to sketches).

These examples introduce a different challenge compared to traditional benchmarks, focusing on domain and style shifts, such as when the target image is a cartoon or stylized sketch, or when the visual appearance changes dramatically between the reference and target. These results demonstrate SANSA strong generalization. Importantly, this robustness across domains and styles is inherited from the frozen SAM2. Our method preserves this capability by learning a semantic mapping within the frozen feature space, enabling reliable correspondence even under significant distribution shifts.

Table 3: Ablation on COCO-20 $^{i}$ . Left: fine-tuning underperforms adaptation. Middle: simple adapters yield strong gains, while higher capacity (larger bottlenecks or added complexity, e.g., MONA) hurts generalization. Right: adapting the last two stages suffices to disentangle semantics.

<table><tr><td colspan="3">Fine-tuning strategies</td><td colspan="2">Adaptation strategies</td><td colspan="3">Adapter placement</td></tr><tr><td>Method</td><td>Params</td><td>mIoU</td><td>Method</td><td>mIoU</td><td>Stages</td><td></td><td>mIoU</td></tr><tr><td>Frozen</td><td>0</td><td>32.2</td><td>LoRA [32]</td><td>58.0</td><td>None</td><td>-</td><td>32.2</td></tr><tr><td>From Scratch</td><td>224 M</td><td>37.1</td><td>Adapter [31]</td><td>59.4</td><td>All</td><td>0–3</td><td>59.4</td></tr><tr><td>Full FT</td><td>224 M</td><td>51.6</td><td>MONA [80]</td><td>56.9</td><td>Early</td><td>0–1</td><td>38.7</td></tr><tr><td>Decoder FT</td><td>4 M</td><td>52.1</td><td>AdaptFormer [14]</td><td></td><td>Middle</td><td>1–2</td><td>57.9</td></tr><tr><td>QKV FT</td><td>50 M</td><td>55.3</td><td>Bottleneck 0.8× channel dim</td><td>58.2</td><td>Late</td><td>2–3</td><td>60.2</td></tr><tr><td>Backbone FT</td><td>210 M</td><td>55.2</td><td>Bottleneck 0.5× channel dim</td><td>59.6</td><td></td><td></td><td></td></tr><tr><td>SANSA</td><td>10 M</td><td>60.2</td><td>Bottleneck 0.3× channel dim</td><td>60.2</td><td></td><td></td><td></td></tr></table>

## 4.4 Ablation studies

We investigate three central aspects of our design: adaptation vs. fine-tuning, adapter architecture and capacity, and adapter placement. Results are summarized in Tab. 3.

Why adaptation instead of fine-tuning? A central question of our work is how to distill knowledge from a pretrained model (i.e., SAM2) while preserving generalization, a key challenge in FSS. To this end, we evaluate fine-tuning strategies targeting the decoder, QKV projections, backbone, and full model, and compare them with inserting adapters into frozen weights. Results show that adaptation outperforms fine-tuning, indicating that it better preserves SAM2 pretrained priors, shifting the embedding space toward task-relevant semantics without altering the underlying representations.

What makes an adaptation strategy effective? Basic adapters such as LoRA $[32]$ , Adapter $[31]$ , and AdaptFormer $[14]$ all yield similar gains around $\sim27\%$ mIoU over frozen SAM2. The slight gains ( $\sim2\%$ ) with Adapter and AdaptFormer w.r.t. LoRA suggest that a simple non-linearity can refine this structure but not fundamentally reshape it. By contrast, increasing adapter capacity, either by enlarging the bottleneck or using more complex designs such as MONA $[80]$ , reduces generalization. These results show that effective adaptation thus requires simplicity and constraint: low-capacity, bottlenecked modules best expose SAM2 latent semantics, while excessive capacity tends to overfit.

Where should adapters be placed? Prior works often insert adapters throughout the entire backbone. In our case, we find that adapting only the last two stages is sufficient, as these layers already capture high-level semantic information, which is the focus of our disentanglement objective.

Additional ablations, including backbone scale and training objective, are provided in Appendix D.

## 5 Conclusions

In this work, we introduced SANSA, which enhances SAM2 to accept and propagate a visual prompt across frames, and showed that its memory attention mechanism can be re-focused towards semantic correspondences by restructuring the feature space. We addressed three fundamental inquiries: (1) we demonstrated that semantic information can be extracted from SAM2 features through lightweight bottleneck transformations, answering our initial research question, (2) we showed that this can be achieved while keeping SAM2 frozen, thereby preserving its segmentation capabilities, and finally (3) we experimentally verified that the learned semantic mapping generalizes robustly to novel classes, with SOTA performance on strict few-shot benchmarks and against generalist models. Beyond technical contributions, SANSA offers practical advantages: it supports diverse prompts for annotation-efficient applications, and offers a 3x speed increase. Finally, our results suggest that foundation models like SAM2 may contain richer task-adaptable knowledge than their original objectives imply, a direction worthy of future exploration.

Acknowledgements. Claudia Cuttano was supported by the Sustainable Mobility Center (CNMS) which received funding from the European Union Next Generation EU (Piano Nazionale di Ripresa e Resilienza (PNRR), Missione 4 Componente 2 Investimento 1.4 "Potenziamento strutture di ricerca e creazione di "campioni nazionali di R&S" su alcune Key Enabling Technologies") with grant agreement no. CN\_00000023.

Gabriele Trivigno, Giuseppe Averta and Carlo Masone were supported by FAIR - Future Artificial Intelligence Research which received funding from the European Union Next-GenerationEU (PIANO NAZIONALE DI RIPRESA E RESILIENZA (PNRR) – MISSIONE 4 COMPONENTE 2, INVESTIMENTO 1.3 – D.D. 1555 11/10/2022, PE00000013). This manuscript reflects only the authors' views and opinions, neither the European Union nor the European Commission can be considered responsible for them.

We acknowledge the CINECA award under the ISCRA initiative, for the availability of high performance computing resources.

## References

[1] A. Aghajanyan, L. Zettlemoyer, and S. Gupta. Intrinsic dimensionality explains the effectiveness of language model fine-tuning. In Proceedings of International Joint Conference on Natural Language Processing, pages 7319–7328. Association for Computational Linguistics, 2021. 2, 5

[2] M. Awais, M. Naseer, S. Khan, R. M. Anwer, H. Cholakkal, M. Shah, M.-H. Yang, and F. S. Khan. Foundation models defining a new era in vision: a survey and outlook. IEEE Transactions on Pattern Analysis and Machine Intelligence, 2025. 3

[3] Y. Bai, Q. Yu, B. Yun, D. Jin, Y. Xia, and Y. Wang. FS-MedSAM2: Exploring the Potential of SAM2 for Few-Shot Medical Image Segmentation without Fine-tuning. arXiv preprint arXiv:2409.04298, 2024. 3

[4] A. Bardes, J. Ponce, and Y. LeCun. Vicreg: Variance-invariance-covariance regularization for self-supervised learning. In Int. Conf. Learn. Represent., 2022. 2

[5] A. Bardes, J. Ponce, and Y. LeCun. Vicregl: Self-supervised learning of local visual features. Advances in Neural Information Processing Systems, 35:8799–8810, 2022. 2

[6] H. Bay, T. Tuytelaars, and L. Van Gool. Surf: Speeded up robust features. In Computer Vision–ECCV 2006: 9th European Conference on Computer Vision, Graz, Austria, May 7-13, 2006. Proceedings, Part I 9, pages 404–417. Springer, 2006. 3

[7] R. Bommasani, D. A. Hudson, E. Adeli, R. Altman, S. Arora, S. von Arx, M. S. Bernstein, J. Bohg, A. Bosselut, E. Brunskill, et al. On the opportunities and risks of foundation models. arXiv preprint arXiv:2108.07258, 2021. 1, 3

[8] M. Boudiaf, H. Kervadec, Z. I. Masud, P. Piantanida, I. Ben Ayed, and J. Dolz. Few-shot segmentation without meta-learning: A good transductive inference is all you need? In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 13979–13988, 2021. 24

[9] T. Brown, B. Mann, N. Ryder, M. Subbiah, J. D. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, et al. Language models are few-shot learners. Advances in neural information processing systems, 33:1877–1901, 2020. 27

[10] S. Candemir, S. Jaeger, K. Palaniappan, J. P. Musco, R. K. Singh, Z. Xue, A. Karargyris, S. Antani, G. Thoma, and C. J. McDonald. Lung segmentation in chest radiographs using anatomical atlases with nonrigid registration. IEEE transactions on medical imaging, 33(2):577–590, 2013. 2

[11] M. Caron, H. Touvron, I. Misra, H. Jégou, J. Mairal, P. Bojanowski, and A. Joulin. Emerging properties in self-supervised vision transformers. In Proceedings of the IEEE/CVF international conference on computer vision, pages 9650–9660, 2021. 2, 18

[12] H. Chen, Y. Dong, Z. Lu, Y. Yu, and J. Han. Pixel matching network for cross-domain few-shot segmentation. In Proceedings of the IEEE/CVF winter conference on applications of computer vision, pages 978–987, 2024. 23

[13] L.-C. Chen, G. Papandreou, I. Kokkinos, K. Murphy, and A. L. Yuille. Deeplab: Semantic image segmentation with deep convolutional nets, atrous convolution, and fully connected crfs. IEEE transactions on pattern analysis and machine intelligence, 40(4):834–848, 2017. 1

[14] S. Chen, C. Ge, Z. Tong, J. Wang, Y. Song, J. Wang, and P. Luo. Adaptformer: Adapting vision transformers for scalable visual recognition. Advances in Neural Information Processing Systems, 35:16664–16678, 2022. 5, 7, 10, 19, 26, 27

[15] X. Chen, R. Mottaghi, X. Liu, S. Fidler, R. Urtasun, and A. Yuille. Detect what you can: Detecting and representing objects using holistic models and body parts. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 1971–1978, 2014. 28

[16] B. Cheng, I. Misra, A. G. Schwing, A. Kirillov, and R. Girdhar. Masked-attention mask transformer for universal image segmentation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 1290–1299, 2022. 1

[17] C. Cheng, L. Song, R. Xue, H. Wang, H. Sun, Y. Ge, and Y. Shan. Meta-adapter: An online few-shot learner for vision-language model. In NeurIPS, 2023. 2

[18] N. Codella, V. Rotemberg, P. Tschandl, M. E. Celebi, S. Dusza, D. Gutman, B. Helba, A. Kalloo, K. Liopyris, M. Marchetti, et al. Skin lesion analysis toward melanoma detection 2018: A challenge hosted by the international skin imaging collaboration (isic). arXiv preprint arXiv:1902.03368, 2019. 2

[19] C. Cuttano, G. Trivigno, G. Rosi, C. Masone, and G. Averta. Samwise: Infusing wisdom in sam2 for text-driven video segmentation. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 3395–3405, 2025. 3

[20] P. Engstler, L. Melas-Kyriazi, C. Rupprecht, and I. Laina. Understanding self-supervised features for learning unsupervised instance segmentation. arXiv preprint arXiv:2311.14665, 2023. 7

[21] M. Everingham, L. Van Gool, C. K. Williams, J. Winn, and A. Zisserman. The pascal visual object classes (voc) challenge. International journal of computer vision, 88:303–338, 2010. 28

[22] Q. Fan, W. Pei, Y.-W. Tai, and C.-K. Tang. Self-support few-shot semantic segmentation. In European Conference on Computer Vision, pages 701–719. Springer, 2022. 3, 26, 27

[23] H. Gao, J. Xiao, Y. Yin, T. Liu, and J. Shi. A mutually supervised graph attention network for few-shot segmentation: The perspective of fully utilizing limited samples. IEEE Transactions on neural networks and learning systems, 35(4):4826–4838, 2022. 7, 28

[24] A. Gupta, P. Dollar, and R. Girshick. Lvis: A dataset for large vocabulary instance segmentation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 5356–5364, 2019. 7, 28

[25] K. He, H. Fan, Y. Wu, S. Xie, and R. Girshick. Momentum contrast for unsupervised visual representation learning. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 9729-9738, 2020. 18

[26] K. He, G. Gkioxari, P. Dollár, and R. Girshick. Mask r-cnn. In Proceedings of the IEEE international conference on computer vision, pages 2961–2969, 2017. 1

[27] R. He, L. Liu, H. Ye, Q. Tan, B. Ding, L. Cheng, J.-W. Low, L. Bing, and L. Si. On the effectiveness of adapter-based tuning for pretrained language model adaptation. In ACI, 2021. 19

[28] W. He, Y. Zhang, W. Zhuo, L. Shen, J. Yang, S. Deng, and L. Sun. Apseg: auto-prompt network for cross-domain few-shot semantic segmentation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 23762-23772, 2024. 2

[29] O. J. Hénaff, S. Koppula, J.-B. Alayrac, A. Van den Oord, O. Vinyals, and J. Carreira. Efficient visual pretraining with contrastive detection. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 10086–10096, 2021. 2, 3

[30] S. Hong, S. Cho, J. Nam, S. Lin, and S. Kim. Cost aggregation with 4d convolutional swin transformer for few-shot segmentation. In European Conference on Computer Vision, pages 108–126. Springer, 2022. 3, 23, 27

[31] N. Houlsby, A. Giurgiu, S. Jastrzebski, B. Morrone, Q. De Laroussilhe, A. Gesmundo, M. Attariyan, and S. Gelly. Parameter-efficient transfer learning for NLP. In International conference on machine learning, pages 2790–2799. PMLR, 2019. 2, 10, 19

[32] E. J. Hu, Y. Shen, P. Wallis, Z. Allen-Zhu, Y. Li, S. Wang, L. Wang, W. Chen, et al. Lora: Low-rank adaptation of large language models. Int. Conf. Learn. Represent., 1(2):3, 2022. 2, 5, 10, 19

[33] S. Kim, D. Min, B. Ham, S. Jeon, S. Lin, and K. Sohn. Fcss: Fully convolutional self-similarity for dense semantic correspondence. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 6560–6569, 2017. 3

[34] A. Kirillov, K. He, R. Girshick, C. Rother, and P. Dollár. Panoptic segmentation. in 2019 ieee. In CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 9396–9405, 2018. 1

[35] A. Kirillov, E. Mintun, N. Ravi, H. Mao, C. Rolland, L. Gustafson, T. Xiao, S. Whitehead, A. C. Berg, W.-Y. Lo, et al. Segment anything. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 4015–4026, 2023. 1, 4

[36] C. Lang, G. Cheng, B. Tu, and J. Han. Learning what not to segment: A new perspective on few-shot segmentation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 8057-8067, 2022. 3, 5, 26, 27

[37] C. Li, H. Farkhoor, R. Liu, and J. Yosinski. Measuring the intrinsic dimension of objective landscapes. In Int. Conf. Learn. Represent., 2018. 2

[38] G. Li, V. Jampani, L. Sevilla-Lara, D. Sun, J. Kim, and J. Kim. Adaptive prototype learning and allocation for few-shot segmentation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 8334-8343, 2021. 1, 3, 26, 27

[39] T.-Y. Lin, M. Maire, S. Belongie, J. Hays, P. Perona, D. Ramanan, P. Dollár, and C. L. Zitnick. Microsoft coco: Common objects in context. In Computer vision–ECCV 2014: 13th European conference, Zurich, Switzerland, September 6-12, 2014, proceedings, part v 13, pages 740–755. Springer, 2014. 7, 9, 28

[40] Y. Liu, C. Jing, H. Li, M. Zhu, H. Chen, X. Wang, and C. Shen. A simple image segmentation framework via in-context examples. arXiv preprint arXiv:2410.04842, 2024. 9, 28

[41] Y. Liu, N. Liu, Q. Cao, X. Yao, J. Han, and L. Shao. Learning non-target knowledge for few-shot semantic segmentation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 11573–11582, 2022. 1, 3, 26, 27

[42] Y. Liu, M. Zhu, H. Li, H. Chen, X. Wang, and C. Shen. Matcher: Segment anything with one shot using all-purpose feature matching. arXiv preprint arXiv:2305.13310, 2023. 1, 3, 7, 8, 9, 21, 23, 24, 26, 27, 28

[43] D. G. Lowe. Distinctive image features from scale-invariant keypoints. International journal of computer vision, 60:91–110, 2004. 3

[44] L. Meng, S. Lan, H. Li, J. M. Alvarez, Z. Wu, and Y.-G. Jiang. Segic: Unleashing the emergent correspondence for in-context segmentation. In European Conference on Computer Vision, pages 203–220. Springer, 2024. 1, 3, 5, 7, 8, 9, 20, 22, 23, 27, 28

[45] F. Milletari, N. Navab, and S.-A. Ahmadi. V-net: Fully convolutional neural networks for volumetric medical image segmentation. In 2016 fourth international conference on 3D vision (3DV), pages 565–571. Ieee, 2016. 6

[46] J. Min, D. Kang, and M. Cho. Hypercorrelation squeeze for few-shot segmentation. In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pages 6941–6952, October 2021. 3, 23, 27

[47] S. Moon, S. S. Sohn, H. Zhou, S. Yoon, V. Pavlovic, M. H. Khan, and M. Kapadia. Msi: Maximize support-set information for few-shot segmentation. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 19266–19276, 2023. 3, 27

[48] K. Nguyen and S. Todorovic. Feature weighting and boosting for few-shot segmentation. In Proceedings of the IEEE/CVF international conference on computer vision, pages 622-631, 2019. 7, 28

[49] D. Ofri-Amar, M. Geyer, Y. Kasten, and T. Dekel. Neural congealing: Aligning images to a joint semantic atlas. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 19403-19412, 2023. 3

[50] M. Oquab, T. Darcet, T. Moutakanni, H. Vo, M. Szafraniec, V. Khalidov, P. Fernandez, D. Haziza, F. Massa, A. El-Nouby, et al. Dinov2: Learning robust visual features without supervision. arXiv preprint arXiv:2304.07193, 2023. 1, 3, 18

[51] F. Perazzi, J. Pont-Tuset, B. McWilliams, L. Van Gool, M. Gross, and A. Sorkine-Hornung. A benchmark dataset and evaluation methodology for video object segmentation. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 724–732, 2016. 26

[52] A. Radford, J. W. Kim, C. Hallacy, A. Ramesh, G. Goh, S. Agarwal, G. Sastry, A. Askell, P. Mishkin, J. Clark, et al. Learning transferable visual models from natural language supervision. In International conference on machine learning, pages 8748–8763. PmLR, 2021. 1

[53] V. Ramanathan, A. Kalia, V. Petrovic, Y. Wen, B. Zheng, B. Guo, R. Wang, A. Marquez, R. Kovvuri, A. Kadian, et al. Paco: Parts and attributes of common objects. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 7141–7151, 2023. 7

[54] N. Ravi, V. Gabeur, Y.-T. Hu, R. Hu, C. Ryali, T. Ma, H. Khedr, R. Rädle, C. Rolland, L. Gustafson, et al. Sam 2: Segment anything in images and videos. arXiv preprint arXiv:2408.00714, 2024. 1, 3, 7, 16, 20, 21

[55] I. Rocco, R. Arandjelović, and J. Sivic. End-to-end weakly-supervised semantic alignment. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, pages 6917-6925, 2018. 3

[56] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 10684-10695, 2022. 3

[57] A. A. Rusu, D. Rao, J. Sygnowski, O. Vinyals, R. Pascanu, S. Osindero, and R. Hadsell. Meta-learning with latent embedding optimization. arXiv preprint arXiv:1807.05960, 2018. 2, 5

[58] C. Ryali, Y.-T. Hu, D. Bolya, C. Wei, H. Fan, P.-Y. Huang, V. Aggarwal, A. Chowdhury, O. Poursaeed, J. Hoffman, et al. Hiera: A hierarchical vision transformer without the bells-and-whistles. In International conference on machine learning, pages 29441–29454. PMLR, 2023. 7, 26, 27

[59] A. Shaban, S. Bansal, Z. Liu, I. Essa, and B. Boots. One-shot learning for semantic segmentation. arXiv preprint arXiv:1709.03410, 2017. 1, 5

[60] A. Shaker, S. T. Wasim, M. Danelljan, S. Khan, M.-H. Yang, and F. S. Khan. Efficient video object segmentation via modulated cross-attention memory. arXiv preprint arXiv:2403.17937, 2024. 19, 20

[61] X. Shi, D. Wei, Y. Zhang, D. Lu, M. Ning, J. Chen, K. Ma, and Y. Zheng. Dense cross-query-and-support attention weighted mask aggregation for few-shot segmentation. In European Conference on Computer Vision, pages 151–168. Springer, 2022. 7

[62] Y. Sun, J. Chen, S. Zhang, X. Zhang, Q. Chen, G. Zhang, E. Ding, J. Wang, and Z. Li. VRP-SAM: SAM with visual reference prompt. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 23565–23574, 2024. 1, 3, 5, 7, 9, 20, 21, 24, 26

[63] L. Tang, M. Jia, Q. Wang, C. P. Phoo, and B. Hariharan. Emergent correspondence from image diffusion. Advances in Neural Information Processing Systems, 36:1363–1389, 2023. 1, 3

[64] T. Taniai, S. N. Sinha, and Y. Sato. Joint recovery of dense correspondence and cosegmentation in two images. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 4246-4255, 2016. 26

[65] H. Touvron, M. Cord, A. El-Nouby, J. Verbeek, and H. Jégou. Three things everyone should know about vision transformers. In European Conference on Computer Vision, pages 497–515. Springer, 2022. 19

[66] N. Tumanyan, O. Bar-Tal, S. Bagon, and T. Dekel. Splicing vit features for semantic appearance transfer. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 10748-10757, 2022. 3

[67] O. Vinyals, C. Blundell, T. Lillicrap, D. Wierstra, et al. Matching networks for one shot learning. Advances in neural information processing systems, 29, 2016. 5

[68] H. Wang, X. Zhang, Y. Hu, Y. Yang, X. Cao, and X. Zhen. Few-shot semantic segmentation with democratic attention networks. In Computer Vision–ECCV 2020: 16th European Conference, Glasgow, UK, August 23–28, 2020, Proceedings, Part XIII 16, pages 730–746. Springer, 2020. 3, 27

[69] K. Wang, J. H. Liew, Y. Zou, D. Zhou, and J. Feng. Panet: Few-shot image semantic segmentation with prototype alignment. In proceedings of the IEEE/CVF international conference on computer vision, pages 9197-9206, 2019. 1, 3, 5, 26, 27

[70] X. Wang, W. Wang, Y. Cao, C. Shen, and T. Huang. Images speak in images: A generalist painter for in-context visual learning. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 6830–6839, 2023. 9, 27

[71] X. Wang, X. Zhang, Y. Cao, W. Wang, C. Shen, and T. Huang. Seggpt: Towards segmenting everything in context. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 1130–1140, 2023. 3, 9, 27, 28

[72] Y. Wang, N. Luo, and T. Zhang. Focus on query: Adversarial mining transformer for few-shot segmentation. Advances in neural information processing systems, 36:31524–31542, 2023. 7, 23

[73] Z. Wei, L. Chen, Y. Jin, X. Ma, T. Liu, P. Ling, B. Wang, H. Chen, and J. Zheng. Stronger fewer & superior: Harnessing vision foundation models for domain generalized semantic segmentation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 28619–28630, 2024. 3

[74] Q. Xu, G. Lin, C. C. Loy, C. Long, Z. Li, and R. Zhao. Eliminating feature ambiguity for few-shot segmentation. In European Conference on Computer Vision, pages 416–433. Springer, 2024. 23, 24

[75] Q. Xu, X. Liu, L. Zhu, G. Lin, C. Long, Z. Li, and R. Zhao. Hybrid mamba for few-shot segmentation. Advances in Neural Information Processing Systems, 37:73858–73883, 2025. 3, 7, 23, 24

[76] C. Yang, Z. Wu, B. Zhou, and S. Lin. Instance localization for self-supervised detection pretraining. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 3987–3996, 2021. 2, 3

[77] J. Yang, K. Zhang, Z. Cui, J. Su, J. Luo, and X. Wei. Inscon: Instance consistency feature representation via self-supervised learning. arXiv preprint arXiv:2203.07688, 2022. 2, 3

[78] Z. Yang, Y. Wei, and Y. Yang. Associating objects with transformers for video object segmentation. Advances in Neural Information Processing Systems, 34:2491–2502, 2021. 19, 20

[79] Z. Yang and Y. Yang. Decoupling features in hierarchical propagation for video object segmentation. Advances in Neural Information Processing Systems, 35:36324–36336, 2022. 19, 20

[80] D. Yin, L. Hu, B. Li, Y. Zhang, and X. Yang. 5%>100%: Breaking performance shackles of full fine-tuning on visual recognition tasks. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 20071–20081, 2025. 10

[81] J. Yu, Z. Lin, J. Yang, X. Shen, X. Lu, and T. S. Huang. Free-form image inpainting with gated convolution. In Proceedings of the IEEE/CVF international conference on computer vision, pages 4471-4480, 2019. 24

[82] Y. Yuan. On the power of foundation models. In International Conference on Machine Learning, pages 40519-40530. PMLR, 2023. 1

[83] A. Zhang, G. Gao, J. Jiao, C. H. Liu, and Y. Wei. Bridge the Points: Graph-based Few-shot Segment Anything Semantically. arXiv preprint arXiv:2410.06964, 2024. 1, 2, 3, 7, 8, 9, 20, 21, 22, 23, 24, 26

[84] G. Zhang, G. Kang, Y. Yang, and Y. Wei. Few-shot segmentation via cycle-consistent transformer. Advances in Neural Information Processing Systems, 34:21984–21996, 2021. 3, 27

[85] J. Zhang, C. Herrmann, J. Hur, E. Chen, V. Jampani, D. Sun, and M.-H. Yang. Telling left from right: Identifying geometry-aware semantic correspondence. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 3076–3085, 2024. 1, 3

[86] J. Zhang, C. Herrmann, J. Hur, L. Polania Cabrera, V. Jampani, D. Sun, and M.-H. Yang. A tale of two features: Stable diffusion complements dino for zero-shot semantic correspondence. Advances in Neural Information Processing Systems, 36:45533–45547, 2023. 1, 3, 6, 7, 26

[87] R. Zhang, Z. Jiang, Z. Guo, S. Yan, J. Pan, X. Ma, H. Dong, P. Gao, and H. Li. Personalize segment anything model with one shot. arXiv preprint arXiv:2305.03048, 2023. 1, 3, 7, 21

[88] B. Zhou, H. Zhao, X. Puig, T. Xiao, S. Fidler, A. Barriuso, and A. Torralba. Semantic understanding of scenes through the ade20k dataset. International Journal of Computer Vision, 127:302–321, 2019. 28

[89] M. Zhu, Y. Liu, Z. Luo, C. Jing, H. Chen, G. Xu, X. Wang, and C. Shen. Unleashing the potential of the diffusion model in few-shot semantic segmentation. arXiv preprint arXiv:2410.02369, 2024. 1, 3, 5, 7, 8, 9, 23, 27

[90] X. Zou, J. Yang, H. Zhang, F. Li, L. Li, J. Wang, L. Wang, J. Gao, and Y. J. Lee. Segment everything everywhere all at once. Advances in neural information processing systems, 36:19769–19782, 2023. 1, 24

[91] H. Zu, J. Ge, H. Xiao, J. Xie, Z. Zhou, Y. Meng, J. Ni, J. Niu, L. Zhang, L. Ni, et al. Rethinking Few-Shot Medical Image Segmentation by SAM2: A Training-Free Framework with Augmentative Prompting and Dynamic Matching. arXiv preprint arXiv:2503.04826, 2025. 3

## Appendix

## Table of Contents:

• §A: Discussion

\- §B: Emergence of Semantic Representations

\- §C: Scalable and Fast Annotation

• §D: Baselines and Ablation Studies

\- §E: Additional Datasets and Qualitative Comparison

\- §G: Exploratory Analysis: Negative Prompts

\- §F: Exploring Dependence on Spatial Continuity in SAM2

\- §H: Implementation and Reproducibility

## A Discussion

## A.1 Limitations and Future Works

By keeping the Segment Anything 2 (SAM2) [54] model entirely frozen and storing only adapter weights, our SANSA preserves SAM2 state-of-the-art performance on Video Object Segmentation (VOS), while enabling few-shot segmentation within a unified pipeline. As our method builds directly upon SAM2, it also inherits its design assumptions and limitations. In particular, while SAM2 supports tracking and segmenting multiple objects across a video, it does so by processing each object independently. This behavior is standard in few-shot segmentation, where each object is typically queried and segmented in isolation using a separate prompt. Nevertheless, future work could explore leveraging contextual relationships between multiple objects, which may improve segmentation accuracy through cross-instance interactions and enable multi-class few-shot segmentation.

## A.2 Societal Impacts

Our method leverages the publicly available, pre-trained weights of Segment Anything 2 (SAM2), thus requiring minimal additional computational resources. This significantly limits the environmental impact commonly associated with training large foundation models from scratch. By providing an analysis of the underlying mechanisms of foundation models like SAM2, we contribute to a deeper understanding of their operation and potential applications beyond conventional tasks. We believe this knowledge can foster broader awareness and acceptance of foundation models both within and outside the scientific community.

Moreover, our approach facilitates the efficient annotation of large-scale datasets with minimal human effort (see Section C). Given that data annotation represents one of the primary bottlenecks and cost drivers in deploying vision models in real-world scenarios, our method could bring benefit in reducing the impact of computational burdens associated with dataset curation.

However, we recognize potential risks inherent to few-shot learning methods, including SANSA. Specifically, its capability for rapid adaptation with limited data could be exploited in ways that raise ethical and privacy concerns. For example, SANSA might be applied in surveillance systems to identify individuals without their consent, posing risks to personal privacy and civil liberties.

## B Emergence of Semantic Representations

## B.1 Analyzing Semantic Structure via Principal Component Decomposition

Our hypothesis is that SAM2 features do encode semantic information, albeit entangled with low-level signals, whereas our adapted SANSA features disentangle this semantic content to make it explicit. To validate this hypothesis, we analyze the feature spaces of both models via a clustering-based experiment, reported in Fig. 8. Specifically, we evaluate how well semantic clusters form in lower-dimensional subspaces obtained via PCA, comparing frozen SAM2 to our adapted SANSA features. To this end, we extract object-level features from fold 0 of COCO- $20^{i}$ , which contains categories unseen by SANSA (trained on the remaining folds). We then analyze the semantic organization of these features through a clustering-based assignment task combined with Principal Component Analysis (PCA):

![](images/dfc5bd7b8cd72ed672a8e0f5022a6cf4b6399634e64322978fd08e9357944ed8.jpg)  
Figure 8: Semantic information concentration across principal components. (a) We evaluate how semantic information is distributed across the principal components of the feature space. For each number of retained components (x-axis), we compute class centroids on COCO-20 $^{i}$ training embeddings and assign test embeddings to the nearest centroid. The y-axis shows the relative classification accuracy, normalized by the accuracy at full dimensionality. A steep rise (SANSA) indicates that semantic information is concentrated in the leading components; a gradual rise (SAM2) suggests it is entangled with other signals. (b) 2D PCA projection of frozen SAM2 features, colored by class. Semantic structure is weak, with significant overlap across classes. (c) 2D PCA projection of SANSA features, showing compact and well-separated clusters aligned with semantic categories.

1. We apply PCA to the extracted features, varying the number of principal components (PCs) retained, from 2 up to 450, capturing 99% of the total variance.

2. For each reduced-dimensionality representation, class centroids are computed on the training set features using k-means clustering.

3. During testing, embeddings from the test set are assigned to the nearest centroid based on minimum Euclidean distance.

4. The assignment accuracy per class is computed using the ground-truth labels.

Plot (a) reports the relative assignment accuracy (y-axis) as a function of the number of PCs (x-axis). This accuracy is normalized by the overall accuracy obtained with the full feature space (i.e., no dimensionality reduction) for each method, allowing a direct comparison of how semantic information concentrates across principal components independently of absolute accuracy differences. The results reveal a marked difference between SAM2 and SANSA. The blue curve (SAM2) shows a gradual increase in accuracy as more PCs are included, indicating that semantic and non-semantic signals are mixed across many leading components. Conversely, the orange curve (SANSA) exhibits a sharp rise with only a few PCs, revealing that semantic information is concentrated and explicitly encoded in the leading principal components of the adapted feature space.

Plots (b) and (c) provide a visual illustration of this phenomenon by projecting the features onto the first two principal components and coloring them by class label. The frozen SAM2 features, in plot (b), show weak class discriminability, confirming that their semantic structure is entangled with task-specific features optimized for SAM2 original tracking objective. Conversely, SANSA features, in plot (c), form compact, well-separated clusters, indicating that semantic information dominates the main axes of variation in the adapted feature space.

## B.2 Semantic Discriminability and Downstream Transferability

The previous analysis revealed that in the adapted SANSA feature space, semantic information is predominantly encoded. This raises a natural follow-up question: to what extent this semantic information was already encoded in the original, frozen SAM2 features, and how easily can it be accessed for downstream tasks?

To investigate this, we present a two-fold analysis in Fig. 9, comparing two models: i) frozen SAM2, and ii) our SANSA trained on folds 1, 2, 3 of COCO- $20^{i}$ . We conduct two experiments on fold 0, i.e. on unseen classes for our model:

1. Linear probing: following standard practice in representation learning $[25, 50, 11]$ , we conduct a linear probing experiment to assess semantic discriminability in the two feature spaces. We extract features from both models and train a pixel-level linear classifier on the training set of COCO-20 $^{i}$ fold 0. Note that both models are frozen and only a single linear layer is trained for the task of semantic segmentation. Evaluation is performed on the corresponding validation set. A high mean Intersection-over-Union (mIoU) indicates that semantic signals are present in the feature space and can be recovered by a simple linear projection.

2. Few-Shot Segmentation: on the same COCO- $20^{i}$ fold, we test the performance of frozen SAM2 and SANSA on unseen classes in the downstream task of few-shot segmentation.

On the left side of the plot, the results indicate that SAM2 achieves 65.8% mIoU with a simple linear probe, confirming that they encode a non-trivial amount of semantic information that is linearly accessible. Interestingly, when repeating the same experiment using our SANSA features, we observe only a modest improvement to 69.2% mIoU (+3.4%).

Semantic Discriminability vs. Downstream Performance  
![](images/008f21510d6c0ce92d1c8d0d27b9cfc6c9a7db963ca69a2e2a9d47f2741ec934.jpg)  
Figure 9: Left: Linear probing for Semantic Segmentation on a fold of COCO-20 $^{i}$ , comparing frozen SAM2 and SANSA (trained on a disjoint class set). Right: Few-shot segmentation performance on the same set of data. Despite poor performance on few-shot segmentation, a simple linear layer (cf linear probing) can learn to discriminate semantic-classes from SAM2 frozen features. These results, together, suggest the presence of semantic structure, albeit entangled with other signals.

On the right, FSS results show that SAM2 achieves 28.9% mIoU, while SANSA reaches 57.5%, with a substantial +28.6% improvement. When considered together, these results highlight a key insight: although SAM2 features already encode meaningful semantic cues, their utility in downstream tasks is limited by the way this information is entangled with low-level and instance-specific signals. The relatively modest gain in linear probing performance (+3.4%) compared to the substantial improvement in few-shot segmentation (+28.6%) suggests that SANSA primarily reorganizes the latent structure into an explicitly semantic form, enabling downstream tasks that require semantic-level understanding.

## B.3 Extracting Semantics Without Compromising SAM2 Capabilities

In the previous sections, we investigate how SANSA exposes the latent semantic structure embedded in frozen SAM2 features, which was our main goal. Moreover, an important principle of our design was to extract this semantic structure without sacrificing SAM2 Promptable Segmentation capabilities or its state-of-the-art performance on Video Object Segmentation. Consequently, our choice was to insert AdaptFormer blocks $[14]$ into the last two layers of the frozen Image Encoder, which introduce residual bottleneck projections, reorganizing the feature space without altering any of the SAM2 weights.

For comparison, we evaluate several alternative adaptation strategies: i) fine-tuning only the decoder, ii) fine-tuning the Query, Key, and Value (QKV) projections within the attention layers $[65]$ , and iii) full backbone fine-tuning. Decoder fine-tuning updates around 4 million parameters, QKV fine-tuning modifies approximately 50 million parameters, and full backbone fine-tuning involves over 210 million parameters.

Tab. 4 reports results under two settings: out-of-domain, where models are trained on a subset of COCO-20 $^{i}$ folds and evaluated on unseen classes (i.e., the strict few-shot segmentation setting, which is our primary focus), and in-domain, where models are trained on all categories.

Table 4: Comparison of adaptation strategies. We compare various strategies for adapting SAM2 in terms of generalization to unseen classes (out-of-domain) and performance on seen classes (in-domain). SANSA achieves the best out-of-domain mIoU with minimal parameter overhead, while preserving the original SAM2 weights.

<table><tr><td rowspan="2">Adaptation Strategy</td><td colspan="2">COCO-20i</td><td rowspan="2">Trainable Parameters</td><td rowspan="2">SAM2 Weights Update</td></tr><tr><td>in-domain</td><td>out-of-domain</td></tr><tr><td>Decoder Finetuning</td><td>63.7</td><td>52.1</td><td>4 M</td><td>√</td></tr><tr><td>QKV-only Finetuning</td><td>73.5</td><td>55.3</td><td>50 M</td><td>√</td></tr><tr><td>Backbone Finetuning</td><td>74.8</td><td>55.2</td><td>210 M</td><td>√</td></tr><tr><td>AdaptFormer (SANSA)</td><td>72.0</td><td>60.2</td><td>10 M</td><td>✕</td></tr></table>

The table highlights the advantages of our approach. Tuning the decoder provides sub-optimal results both in- and out-of-domain, as performances are constrained by the limited semantic structure of frozen features. Finetuning the backbone, or the attention layers, is effective in producing semantic aware features, as shown by the in-domain performance. However, such fine-tuning, despite its greater capacity which boosts in-domain performance, leads to overfitting to training categories, as shown by the large performance drop on unseen classes.

On the other hand, adapters restrict updates to a low-dimensional bottleneck $[32, 31]$ , forcing the model to prioritize generalizable transformations over spurious in-domain correlations $[27]$ , demonstrating more consistent and stable performance across both seen and unseen classes.

Finally, by maintaining the SAM2 backbone and decoder entirely frozen, we ensure that the original model core capabilities, such as Promptable Segmentation and Video Object Segmentation, remain uncompromised. This is critical to deploying SANSA in practical settings, obtaining a model that fully supports both geometric and visual prompts, by storing only the adapter weights.

## B.4 Exploring Implicit Semantics in Traditional Video Object Segmentation Methods

Our hypothesis is that the class-agnostic training objective of Video Object Segmentation encourages the learning of semantically meaningful representations, even without category supervision. While our main analysis is focused on SAM2, which benefits from its large-scale pretraining, we investigate whether similar semantic understanding properties arise in traditional VOS trackers trained at smaller scale.

To this end, we evaluate three representative VOS methods, AOT [78], DeAOT [79], and MAVOS [60], alongside SAM2, on the COCO- $20^{i}$ 1-shot segmentation benchmark. As shown in Tab. 5, all models exhibit relatively weak performance when directly transferred to few-shot segmentation. We then apply our adaptation to each of these models, and evaluate them in the strict FSS setting on COCO- $20^{i}$ , i.e. focusing on their ability to generalize to previously unseen classes. The results show a consistent behavior: despite their different training scales and capacities, all VOS models demonstrate a large performance gap between their frozen and adapted versions. For instance, MAVOS improves from 27.1% to 52.3% mIoU after adaptation, while SAM2 with Hiera-B improves from 28.0% to 55.4%. The gap between these methods and SAM2-B is attributable to its broader generalization capabilities, stemming from its diverse and large-scale pretraining.

Table 5: Evaluation of traditional Video Object Segmentation methods and SAM2 with and without SANSA adaptation. We report mIoU (%) on COCO- $20^{i}$ 1-shot segmentation.

<table><tr><td>Method</td><td>Backbone</td><td>#Params</td><td>Frozen</td><td>+SANSA</td></tr><tr><td>AOT [78]</td><td>Swin-B</td><td>70 M</td><td>25.0</td><td>48.5</td></tr><tr><td>DeAOT [79]</td><td>Swin-B</td><td>75 M</td><td>26.9</td><td>51.0</td></tr><tr><td>MAVOS [60]</td><td>Swin-B</td><td>96 M</td><td>27.1</td><td>52.3</td></tr><tr><td>SAM2 [54]</td><td>Hiera-B</td><td>86 M</td><td>28.0</td><td>55.4</td></tr><tr><td>SAM2 [54]</td><td>Hiera-L</td><td>234 M</td><td>32.2</td><td>60.2</td></tr></table>

This consistent behavior across models suggests that the VOS training paradigm inherently encourages the emergence of transferable semantic representations. In summary, our findings support the view that such semantic structure is an implicit property of the VOS objective itself, and that it can be effectively made explicit, and successfully repurposed, for downstream semantic tasks.

## C Scalable and Fast Annotation

While the previous sections have established the strong segmentation performance of SANSA across benchmarks, a particularly compelling advantage of our approach is its ability to facilitate fast and scalable annotation in practical, real-world scenarios. In many applications, such as constructing new datasets or adapting models to novel domains, rapid annotation of large image collections without the need for fine-tuning on test categories is essential.

To rigorously evaluate this capability, we simulate a large-scale annotation task on both the COCO-20 $^{i}$ and LVIS-92 $^{i}$ validation sets, mimicking a realistic deployment scenario in which new concepts must be annotated on the fly. For both datasets, we designate fold 0 as the test split, containing categories that are held out during training. Models are trained on the remaining folds. On COCO-20 $^{i}$ , we randomly sample 20 reference images, one per category in fold 0, and use them to guide the segmentation of 10,000 target images sampled from the same fold. On LVIS-92 $^{i}$ , which contains a larger and more fine-grained label space, we similarly sample 92 reference classes from fold 0 and use these to segment 10,000 target images. In both cases, the reference and target sets are fixed across all methods to ensure a fair comparison. Moreover, for all the methods, reference image features are computed once and cached, avoiding repeated backbone forward passes at inference time.

Table 6: Evaluation of large-scale annotation efficiency on COCO-20 $^{i}$ and LVIS-92 $^{i}$ datasets. We report mIoU and wall-clock annotation time (minutes) required to segment 10,000 target images using reference examples from unseen categories in fold 0. Reference features are precomputed and reused for fair comparison. Experiments conducted on an NVIDIA RTX 4090. SANSA achieves the best trade-off between accuracy and speed, demonstrating strong generalization and efficiency.

<table><tr><td rowspan="2">Method</td><td colspan="2">Fold 0</td><td rowspan="2">Total Annotation Time ↓</td></tr><tr><td>COCO mIoU (%) ↑</td><td>LVIS mIoU (%) ↑</td></tr><tr><td>VRP-SAM [62]</td><td>54.8</td><td>34.9</td><td>38 min</td></tr><tr><td>SegIC [44]</td><td>55.1</td><td>46.7</td><td>77 min</td></tr><tr><td>GF-SAM [83]</td><td>59.7</td><td>38.4</td><td>58 min</td></tr><tr><td>SANSA (ours)</td><td>61.2</td><td>55.4</td><td>16 min</td></tr></table>

We benchmark SANSA against recent state-of-the-art few-shot segmentation methods, including GF-SAM [83], SegIC [44], and VRP-SAM [62], by measuring the total wall-clock time required to segment all 10,000 images and evaluating segmentation quality via mean Intersection-over-Union (mIoU) against ground truth masks. Results are summarized in Tab. 6.

SANSA achieves the best trade-off between speed and accuracy across both COCO and LVIS. In particular, it completes annotation $2-5\times$ faster than competing approaches while maintaining the highest mIoU. On LVIS, where the label space is significantly more complex, the gains are more pronounced: SANSA outperforms all baselines by a large margin (+8.7 mIoU over the best competitor), highlighting its strong generalization ability and annotation efficiency.

## D Baselines and Ablation Studies

## D.1 Evaluating the Impact of SAM2 on Prior SAM-Based Pipelines

We analyze the effect of replacing SAM with SAM2 in existing Segment Anything-based methods, namely Matcher $[42]$ , GF-SAM $[83]$ , and VRP-SAM $[62]$ . These methods follow a modular two-stage design: an external backbone (e.g., DINOv2 for Matcher and GF-SAM, ResNet-50 for VRP-SAM) is used to perform feature matching, and the matched features are then used to generate geometric prompts that are passed to SAM, which operates at the image level to predict the final segmentation mask. We re-evaluate these approaches by replacing SAM with SAM2 in the final segmentation step, while leaving the matching backbone unchanged. Note that all these methods adopt the largest version of SAM (SAM-H), hence we replace it with the largest SAM2 version (SAM2-L). As shown in Tab. 7, the performance differences are negligible. This is consistent with findings from the SAM2 paper $[54]$ , which shows that SAM2-L yields only little gains over SAM-H in image-level promptable segmentation tasks. In other words, given the same prompts the segmentation quality is essentially unchanged, as both SAM and SAM2 excel at converting prompt geometry into accurate masks.

Table 7: Performance comparison of Segment Anything-based methods replacing SAM with SAM2. These methods prompt SAM at image-level, hence SAM2 additional capabilities (e.g. mask propagation) play no role in this setting. As a result, SAM2 provides only minimal gains for existing two-stage methods (Matcher [42], GF-SAM [83], VRP-SAM [62]).

<table><tr><td>Method</td><td>Feature Matching Backbone</td><td>Segmentation Model</td><td>mIoU (%)</td></tr><tr><td rowspan="2">PerSAM [87]</td><td>SAM</td><td></td><td>23.0</td></tr><tr><td>SAM2</td><td></td><td>23.6</td></tr><tr><td rowspan="2">Matcher [42]</td><td rowspan="2">DINOv2</td><td>SAM</td><td>52.7</td></tr><tr><td>SAM2</td><td>52.4</td></tr><tr><td rowspan="2">VRP-SAM [62]</td><td rowspan="2">ResNet50</td><td>SAM</td><td>53.9</td></tr><tr><td>SAM2</td><td>54.3</td></tr><tr><td rowspan="2">GF-SAM [83]</td><td rowspan="2">DINOv2</td><td>SAM</td><td>58.7</td></tr><tr><td>SAM2</td><td>58.9</td></tr><tr><td>SANSA (ours)</td><td colspan="2">SAM2</td><td>60.2</td></tr></table>

These findings highlight the fundamental difference between SANSA and previous SAM-based approaches. While prior methods rely on external backbones for matching and treat SAM as a image-level decoder, our architecture tightly integrates all components into a unified pipeline. By leveraging SAM2 not only for mask prediction but also for feature matching and prompt encoding, SANSA ensures more effective feature reuse, leading to stronger performance and improved computational efficiency.

## D.2 Experiments with Different Backbones

In this section, we evaluate the performance of different SAM2 Encoder variants at varying scales. Table 8 presents a comparison of model parameters, inference speed (Frame Per Second), and mIoU across three versions of the model (Tiny, Base, and Large), with Frame Per Second (img/s) values computed on an NVIDIA RTX 4090.

Table 8: Comparison of model parameters, inference speed (FPS), and mIoU for different scales of the SAM2 encoder (Tiny, Base, Large) using Hiera. FPS are measured on an NVIDIA RTX 4090.

<table><tr><td>SANSA Encoder</td><td>Total Parameters</td><td>Trainable Parameters</td><td>Frames Per Second (img/s)</td><td>mIoU (%)</td></tr><tr><td>Tiny</td><td>40 M</td><td>1.3 M</td><td>50</td><td>51.1</td></tr><tr><td>Base</td><td>86 M</td><td>3.3 M</td><td>31</td><td>55.4</td></tr><tr><td>Large</td><td>234 M</td><td>10 M</td><td>15</td><td>60.2</td></tr></table>

All variants of SANSA offer a favorable trade-off between efficiency and accuracy, with consistent gains in mIoU as model capacity increases. Notably, the Large model achieves the highest mIoU of 60.2%, while still maintaining a practical inference speed of 15 FPS.

## D.3 Effect of the Training Objective

We next study the impact of our sequential conditioning objective. When J = 1, training reduces to the standard few-shot segmentation objective, where each target is predicted only from the reference image, without propagation. In contrast, we propagate predictions across multiple unlabeled targets (J > 1), encouraging the model to extract semantic structure that generalizes beyond individual pairs.

Table 9 shows that sequential conditioning consistently improves performance over the baseline with J = 1. We observe the largest gains with J = 3–4, after which results plateau.

Table 9: Ablation on training sequence length J. Using J > 1 improves over the standard few-shot objective (J = 1). Gains saturate at J = 3–4, which we use as default.

<table><tr><td>J</td><td>COCO-20i(1-shot)</td><td>LVIS-92i(1-shot)</td></tr><tr><td>1 (no propagation)</td><td>57.0</td><td>44.7</td></tr><tr><td>2</td><td>58.9</td><td>47.2</td></tr><tr><td>3 (ours)</td><td>60.2</td><td>49.6</td></tr><tr><td>4</td><td>59.8</td><td>49.6</td></tr><tr><td>5</td><td>59.5</td><td>49.8</td></tr><tr><td>7</td><td>60.0</td><td>49.4</td></tr></table>

At inference, we emphasize that sequential conditioning is not used: each target is segmented independently given the annotated reference(s), following the standard few-shot segmentation protocol.

## E Additional Datasets and Qualitative Comparison

## E.1 Qualitative Comparison with Prior Methods

Fig. 10 showcases the performance of SANSA compared to GF-SAM [83] and SegIC [44] on samples from the LVIS-92 $^{i}$ benchmark. Each row visualizes a reference image with an annotated mask and the corresponding target image. We report predictions from the best-performing baselines (GF-SAM [83] and SegIC [44]), our approach (SANSA), and the ground truth segmentation. For clarity, the name of the queried object class is also provided (note, however, that none of the models have access to the class label during inference).

These examples illustrate SANSA ability to resolve fine-grained distinctions and spatial part-awareness, addressing some of the core challenges of LVIS-92 $^{i}$ , where semantically close categories and partial object prompts are common. For instance, in the example where the reference depicts a lamb, SANSA is able to distinguish it from the semantically similar sheep. Similarly, it correctly segments a gazelle while avoiding confusion with adjacent zebras. In another case, SANSA successfully discriminates between a plush monkey and a visually similar plush horse, despite both being soft toys with overlapping colors and textures. Moreover, SANSA exhibits part-level understanding. When prompted with a reference showing a t-shirt, GF-SAM oversegments the full person, while SegIC narrowly restricts to clothing regions. In contrast, SANSA accurately segments the t-shirt alone.

![](images/cc846283a80d1ddabb20b3f37284ea53b6f9dce0ad438685c5ef0054aa66664e.jpg)  
Figure 10: Qualitative comparison on the LVIS-92 $^{i}$ benchmark. For each example, we show: the annotated reference, the target image, predictions from GF-SAM and SegIC, our SANSA prediction, and the ground truth. The queried class name is shown for clarity, but is not used by any model.

These qualitative results complement our quantitative findings, further supporting our hypothesis that SANSA bridges high-level category understanding with fine-grained spatial precision.

## E.2 Additional Experiments: Pascal-5 $^{i}$ and COCO → Pascal

While our main comparisons follow recent works $[44, 89, 42]$ and focus on the benchmarks of COCO-20 $^{i}$ , LVIS-92 $^{i}$ , and FSS-1000, we additionally report results on Pascal-5 $^{i}$ for completeness.

Table 10: Evaluation on Pascal- $5^{i}$ and COCO→Pascal. We report the mean Intersection-over-Union (mIoU) for each fold and the average across folds. All methods are evaluated in a strict few-shot setting, including both the standard Pascal- $5^{i}$ benchmark and the distribution-shift setting (COCO→Pascal), where models are trained on COCO- $20^{i}$ and tested on Pascal- $5^{i}$ . $^{\dagger}$ indicates training-free methods.

<table><tr><td rowspan="2">Method</td><td colspan="5">Pascal-5i</td><td colspan="5">COCO→Pascal</td></tr><tr><td>fold0</td><td>fold1</td><td>fold2</td><td>fold3</td><td>mean</td><td>fold0</td><td>fold1</td><td>fold2</td><td>fold3</td><td>mean</td></tr><tr><td>HSNet [46] [ICCV&#x27;21]</td><td>67.3</td><td>72.3</td><td>62.0</td><td>63.1</td><td>66.2</td><td>47.0</td><td>65.2</td><td>67.1</td><td>77.1</td><td>64.1</td></tr><tr><td>VAT [30] [ECCV&#x27;22]</td><td>70.0</td><td>72.5</td><td>64.8</td><td>64.2</td><td>67.9</td><td>68.3</td><td>64.9</td><td>67.5</td><td>79.8</td><td>65.1</td></tr><tr><td>AMFormer [72] [NIPS&#x27;23]</td><td>71.3</td><td>76.7</td><td>70.7</td><td>63.9</td><td>70.7</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>AENet [74] [ECCV&#x27;24]</td><td>72.2</td><td>75.5</td><td>68.5</td><td>63.1</td><td>69.8</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>HMNet [75] [NIPS&#x27;24]</td><td>72.2</td><td>75.4</td><td>70.0</td><td>63.9</td><td>70.4</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>PMNet [12] [WACV&#x27;24]</td><td>71.3</td><td>72.4</td><td>66.9</td><td>61.9</td><td>68.1</td><td>71.0</td><td>72.3</td><td>66.6</td><td>63.8</td><td>68.4</td></tr><tr><td>Matcher† [42] [ICLR&#x27;24]</td><td>67.7</td><td>70.7</td><td>66.9</td><td>67.0</td><td>68.1</td><td>67.7</td><td>70.7</td><td>66.9</td><td>67.0</td><td>68.1</td></tr><tr><td>GF-SAM† [83] [NIPS&#x27;24]</td><td>71.1</td><td>75.7</td><td>69.2</td><td>73.3</td><td>72.1</td><td>71.1</td><td>75.7</td><td>69.2</td><td>73.3</td><td>72.1</td></tr><tr><td>SANSA (ours)</td><td>78.1</td><td>80.0</td><td>68.3</td><td>66.1</td><td>73.1</td><td>67.1</td><td>70.9</td><td>73.5</td><td>78.6</td><td>72.5</td></tr></table>

These experiments are conducted in the strict few-shot setting and include both the standard evaluation on Pascal- $5^{i}$ , and the distribution-shift setting, COCO→Pascal, where models trained on COCO- $20^{i}$ are evaluated on Pascal- $5^{i}$ with folds repurposed to avoid any class overlap, as proposed originally in [8]. This setup aims to assess the robustness of models to shifts in data distribution, a condition often encountered in practical applications where training and deployment domains may differ. In Tab. 10, we compare with recent specialist few-shot methods (e.g., HMNet [75], AENet [74]) and training-free methods employing two foundation models in cascade (i.e. Matcher [42], GF-SAM [83]). For the latter, we report identical results in both evaluation settings, as these models are frozen and evaluated directly on Pascal- $5^{i}$ without any training. The results confirm the competitive results of SANSA across benchmarks.

## E.3 Promptable Segmentation: Prompt Generation Process and Qualitative Results

We denote the type of annotation as $a_{r}^{k} \in \{mask, point, box, scribble\}$ . Following [62, 90], point-based reference prompts are generated by randomly sampling between 1 and 20 points from the ground truth (GT). Scribble-based prompts are obtained, consistently with [62, 90], by using the free-form training mask generation algorithm proposed in [81], producing 1 to 20 scribbles per sample. Box-based prompts are derived by extracting object bounding boxes from the GT annotations.

In Fig. 11, we show the performance of SANSA in one-shot promptable segmentation. SANSA yields consistent and robust results across various prompts, including points, boxes, and scribbles.

![](images/21fbcc1a08ce64b3ec258c33cff452db487218b393b109e7724b3d68466d2925.jpg)  
Figure 11: Qualitative results for one-shot few-shot promptable segmentation. The figure illustrates segmentation results using different types of prompts. The first row shows examples where the reference object is annotated with a point, the second row uses bounding box annotations, and the third row employs scribble-based annotations. Examples are extracted from COCO-20 $^{4}$ .

## F Exploratory Analysis: Negative Prompts

Segment Anything 2 supports the use of negative prompts in interactive scenarios. These prompts, such as negative clicks on the image, allow users to correct mistakes by explicitly indicating regions that should not belong to the predicted mask. Since our method builds on SAM2, it is natural to ask whether this mechanism can be extended in the few-shot segmentation setting.

We conducted a small exploratory study to investigate this idea. We consider two ways of extending negative prompting:

\- Geometric negatives: providing negative clicks on the target image at inference time, as in the interactive setting. This setup does not require any retraining and directly uses the mechanism already implemented in SAM2.

\- Semantic negatives: providing additional examples of visually similar but semantically different categories alongside the reference image, to serve as contrastive context (e.g. including a photo of a horse to help disambiguate the target class zebra). We experimented with two simple variants:

\- Training-free: the negative reference is added to the Memory Bank with an empty mask.

\- Training-based: a small MLP maps the average feature of a negative object into a learnable negative token, similar to SAM2 handling of negative clicks.

The results in Table 11 indicate that both geometric and semantic negative prompts can provide measurable benefits in few-shot segmentation. However, this should be regarded as an exploratory direction: in particular, semantic negative prompting currently lacks standardized baselines and evaluation protocols, but represents a promising extension of the few-shot setting for future work.

Table 11: Exploratory results with negative prompts on COCO-20 $^{i}$ . Geometric negatives act as test-time corrections. Semantic negatives provide contrastive context.

<table><tr><td>Method</td><td>mIoU</td></tr><tr><td>SANSA (baseline)</td><td>60.2</td></tr><tr><td colspan="2">Geometric Negative Prompts</td></tr><tr><td>+1 click</td><td>60.8</td></tr><tr><td>+3 clicks</td><td>62.9</td></tr><tr><td>+5 clicks</td><td>64.5</td></tr><tr><td colspan="2">Semantic Negative Prompts</td></tr><tr><td>Training-free</td><td>61.2</td></tr><tr><td>Training-based</td><td>63.0</td></tr></table>

## F.1 Part Segmentation: Qualitative Results

In one-shot part segmentation (Fig. 12), SANSA demonstrates strong abilities to retrieve fine-grained object parts, highlighting the effectiveness of our method in learning part-level representations.

![](images/9b56baad0f5688350983b6cc71d946c66288867be271dfc5a40f8d0578fd3e8b.jpg)  
Figure 12: Qualitative results for one-shot part segmentation. Examples from Pascal-Part.

## G Exploring Dependence on Spatial Continuity in SAM2

The SAM2 model targets is tracking in temporally coherent videos. However, its architecture imposes no prior on spatial continuity. As detailed in Eq. (3), masks are propagated across frames through a cross-attention between features, which allows all-to-all matching. Spatial coherence is thus not structurally enforced, but rather an emergent bias arising from pretraining on videos, encoded in the feature space. Our core finding is that this feature space contains latent semantic structure, entangled with spatial and appearance-related cues. Our adaptation disentangles these signals to isolate semantic information, enabling matching and segmentation across spatially independent inputs.

A natural question is how this implicit spatial continuity bias affects SAM2 behavior in practice. To investigate this, we adopt the spatial coherence metric of $[86]$ , which computes the average first-order gradient of the displacement field induced by feature matching. Low values indicate smooth, object-consistent correspondences, while high values reflect noisy or fragmented matches. We evaluate three conditions with progressively weaker spatial relationships across image pairs:

(i) Consecutive video frames from DAVIS [51], where both temporal and spatial continuity are preserved.

(ii) Flipped DAVIS frames, where the second image is mirrored, disrupting spatial alignment while preserving object identity.

(iii) Independent images from TSS [64], with no spatial or temporal coherence.

As shown in Table 12, SAM2 performs well on natural videos as expected, but its coherence degrades when spatial alignment is perturbed and drops further on independent images. In contrast, SANSA maintains stable coherence across all scenarios, showing its ability to abstract semantic correspondences without relying on spatial continuity.

Table 12: Spatial coherence across varying continuity conditions. Lower is better.

<table><tr><td rowspan="2">Setting</td><td colspan="2">Continuity</td><td rowspan="2">SAM2 ↓</td><td rowspan="2">SANSA ↓</td></tr><tr><td>Appearance</td><td>Spatial</td></tr><tr><td>(i) Video frames (DAVIS)</td><td>√</td><td>√</td><td>1.5</td><td>1.7</td></tr><tr><td>(ii) Flipped frames (DAVIS)</td><td>√</td><td>✗</td><td>5.5</td><td>2.1</td></tr><tr><td>(iii) Independent images (TSS)</td><td>✗</td><td>✗</td><td>9.1</td><td>4.1</td></tr></table>

## H Implementation and Reproducibility

## H.1 Implementation details

We provide full implementation details to support reproducibility.

We adopt SANSA with Hiera-Large $[58]$ as the visual encoder. Hiera is a hierarchical Transformer with channel dimensions $[144, 288, 576, 1152]$ . AdaptFormer $[14]$ adapters are inserted into the last two hierarchical blocks of the encoder (layers 9–48), corresponding to channel dimensions 1152 and 576. In the strict few-shot setting, the adapter hidden size is set to $0.3\times$ the block channel dimension, yielding hidden sizes of 346 (for 1152) and 173 (for 576). This configuration introduces about 10M trainable parameters, while all SAM2 weights remain frozen. In the generalist setting, the adapter hidden size is increased to $0.8\times$ the block channel dimension, which expands the adapters and raises the total number of trainable parameters to about 25M. Training in both settings is performed with AdamW (learning rate $10^{-4}$ ) and gradient clipping to 1.0. We train for 5 epochs in the strict setting and 20 epochs in the generalist setting, with a training sequence length of J=3. Supervision combines Binary Cross Entropy loss and Dice loss, equally weighted (1.0), applied to the predicted segmentation mask and ground truth. We train with batch size 32 on 8 A100 GPUs.

For clarity, all relevant training and architecture details are summarized in Tab. 13.

## H.2 Clarification of Few-Shot Segmentation Evaluation Settings

To avoid ambiguity in terminology and evaluation protocols, we first clarify the conventions followed in our work. In traditional few-shot segmentation literature $[38, 69, 36, 41, 22]$ , the annotated image is typically referred to as the support image, while the unannotated image to be segmented is called the query image. However, more recent works $[62, 42, 83]$ have shifted terminology, denoting the annotated image as the reference, and the image to be segmented as the target. We adopt this updated nomenclature throughout our work.

Table 13: Summary of architecture and training hyperparameters.

<table><tr><td>Component</td><td>Value / Description</td></tr><tr><td>Base model</td><td>SAM2 (frozen)</td></tr><tr><td>Visual encoder</td><td>Hiera-Large [58]</td></tr><tr><td>Adapter type</td><td>AdaptFormer [14]</td></tr><tr><td>Adapted layers</td><td>Last two blocks (layers 9–48)</td></tr><tr><td>Adapter hidden size</td><td>0.3× (strict) / 0.8× (generalist) of block dim.</td></tr><tr><td>Trainable parameters</td><td>~10M (strict) / ~20M (generalist)</td></tr><tr><td>Optimizer</td><td>Adam</td></tr><tr><td>Learning rate</td><td> $10^{-4}$ </td></tr><tr><td>Gradient clipping</td><td>1.0</td></tr><tr><td>Batch size</td><td>32</td></tr><tr><td>Training epochs</td><td>5 (strict) / 20 (generalist)</td></tr><tr><td>Training sequence length</td><td>J = 3</td></tr><tr><td>Loss function</td><td>BCE (1.0) + Dice (1.0)</td></tr></table>

Beyond terminology, few-shot segmentation is commonly evaluated under two distinct settings: the strict few-shot setting and the more recent generalist in-context setting. We describe both below to clarify the assumptions and evaluation scope of our method.

Strict Few-Shot Segmentation. Early methods in few-shot segmentation $[38, 69, 36, 41, 22, 68, 84, 47, 46, 30]$ adopt a meta-learning framework, where the goal is to segment novel object classes given only a few annotated examples. Training proceeds episodically: each episode samples a subset of classes from a predefined training set, along with labeled reference images and corresponding unlabeled target images. The model must then predict segmentation masks for target images that contain instances of the same classes shown in the support set. A key assumption of this setup is the strict separation between training (seen) and evaluation (unseen) classes. This constraint ensures that performance reflects a model ability to generalize to entirely novel categories. To emphasize this evaluation protocol, the setting has recently been referred to $[89, 44]$ as strict few-shot segmentation.

Generalist in-context Setting. The notion of in-context learning was popularized in natural language processing by GPT-3 $[9]$ , where models perform new tasks by conditioning on a sequence of input-output examples, without parameter updates. Rather than being explicitly trained for a single task, these models learn to infer the intended behavior directly from the prompt structure, enabling flexible adaptation to a wide range of downstream tasks. Inspired by this idea, recent vision models such as SegGPT $[71]$ and Painter $[70]$ reformulate segmentation as a conditional image generation problem. These models cast segmentation as a type of image-to-image translation or inpainting: prompts consist of paired inputs and output masks provided as images, and the model completes the target segmentation given these visual exemplars. This formulation allows generalization across a broad set of tasks, such as semantic, instance, and part segmentation, without retraining.

Within few-shot segmentation literature, Matcher $[42]$ builds on this paradigm and proposes the in-context setting, where the model is prompted with examples and conditioned to produce the desired output. This formulation enables a single generalist model to address a wide spectrum of segmentation tasks, including few-shot segmentation, few-shot part segmentation, and video object segmentation. Several recent methods, including DiffewS $[89]$ , SegIC $[44]$ , and our SANSA, adopt this generalist perspective. These approaches operate in a more flexible evaluation regime, where prompts may include both seen and unseen classes, relaxing the disjoint class constraint of the strict setting.

## H.3 Datasets

For strict few-shot segmentation, separate models are trained on COCO-20 $^{i}$ , LVIS-92 $^{i}$ and FSS-1000 following their respective k-fold splits or fixed partitions. In contrast, the generalist in-context setting involves training a single model under three progressively more comprehensive configurations: a minimal setup with ADE20K and COCO; an extended setup including LVIS following SegIC $[44]$ ; and a further extended configuration incorporating PACO, following $[71, 40]$ , to mitigate object-level bias and improve part segmentation. Below, we provide brief descriptions of each dataset used in our experiments.

COCO-20 $^{i}$ [48] is constructed from the MSCOCO dataset [39], containing 80 object categories split into four disjoint folds. Each fold includes 60 training classes and 20 test classes. This dataset provides a challenging setting due to its large-scale nature and diverse object appearances.

LVIS-92 $^{i}$ , introduced by Matcher [42], is derived from the LVIS dataset [24] and presents a more challenging few-shot segmentation benchmark, emphasizing long-tail distributions. It consists of 920 classes that appear in at least two images, split into ten folds for cross-validation. This dataset introduces significant variations in object appearances and class distributions.

FSS-1000 [23] is a large-scale few-shot segmentation dataset containing 1,000 classes with pixel-wise annotations, divided into 520 training, 240 validation, and 240 test classes. Unlike LVIS-92 $^{i}$ and COCO-20 $^{i}$ , which use folds, FSS-1000 follows a fixed class partitioning.

PASCAL-Part, introduced by Matcher $[42]$ , is based on PASCAL VOC 2010 $[21]$ and its part annotations released in $[15]$ and provides fine-grained object part annotations. It consists of four superclasses: animals, indoor objects, persons, and vehicles. The dataset contains 56 object parts across 15 categories. Given its focus on object parts rather than whole objects, this dataset presents a challenging segmentation task.

PACO-Part, is derived from PACO, which provides part annotations for 75 object categories. Matcher [42] proposes a k-fold split of the 456 object part classes, from which 303 classes with at least two samples are retained. The dataset is split into four folds, each containing 76 object parts. Similar to PASCAL-Part, PACO-Part is designed for evaluating one-shot part segmentation models, but it includes a larger and more diverse set of categories.

ADE20K [88] is a large-scale semantic segmentation dataset containing 20,210 images annotated with 150 semantic categories at the pixel level. It includes a diverse range of indoor and outdoor scenes, covering natural landscapes, urban environments, and everyday objects.