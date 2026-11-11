# SentinelGraph — Data Quality & Temporal Integrity Research Report

**Status:** Phase 2 Audit & Empirical Verification Complete  
**Date:** November 2026  
**Authors:** SentinelGraph Research & Engineering Team  
**System Working Directory:** `/Users/jasmithav/Downloads/sentinel-graph-copy`  
**Dataset:** Canadian Institute for Cybersecurity Intrusion Detection System 2018 (CIC-IDS2018)

---

## Executive Summary

This report delivers a comprehensive empirical audit of data quality, temporal continuity, and distribution characteristics across the eight integrated CIC-IDS2018 traffic days. Before introducing complex temporal or graph neural architectures, this investigation validates the foundational assumptions of the data pipeline.

### Core Discoveries:
1. **The "Persistence Trap" in Next-State Forecasting:** For volumetric attack campaigns (DDoS, DoS Hulk, Botnet, Infiltration), attacks run continuously for hours. Next-state forecasting ($y_{t+1} \approx y_t$) achieves up to 99.85% F1 simply by copying the previous state (Persistence Baseline). High accuracy in next-state forecasting is predominantly an artifact of autocorrelation, not attack anticipation.
2. **Extreme Attack Onset Scarcity:** Attack onset prediction ($y_{t+1}=1 \land y_t=0$) is an intrinsically distinct and drastically scarcer target. Across all 8 days and 7,198 aggregate states, there are only 205 onset transitions. Crucially, 193 of those onsets (94.1%) are concentrated in just two days: February 22 (103) and February 23 (90).
3. **Attack Modality Dictates Temporal Structure:** Web attacks (Feb 22 and Feb 23) consist of 158 isolated 30-second spikes that flicker on and off. In contrast, DoS, DDoS, and Botnet traffic exist exclusively as monolithic sustained blocks lasting hours with zero isolated spikes.
4. **Dropped Temporal Windows Fracture Continuity:** Resampling traffic into 30-second buckets followed by `.dropna()` dropped 3,195 empty windows across the 8 days (e.g. 748 empty windows on Feb 21, 1,175 on Feb 16). This caused 156 artificial timestamp gaps, fragmenting continuous runs and causing genuine attack onsets to be discarded.

---

## 1. Raw Dataset Audit & Ingestion Integrity

Eight raw CSV files totaling ~2.6 GB and ~7.95 million flows were audited.

| Traffic Day | Raw File Name | Total Flows | Attack Flows | Attack % | Attack Types Present |
|---|---|---:|---:|---:|---|
| **Feb 14 (Wed)** | `Wednesday-14-02-2018_TrafficForML_CICFlowMeter.csv` | 1,048,570 | 380,949 | 36.33% | FTP-BruteForce (193,360), SSH-Bruteforce (187,589) |
| **Feb 15 (Thu)** | `Thursday-15-02-2018_TrafficForML_CICFlowMeter.csv` | 1,048,575 | 52,498 | 5.01% | DoS-GoldenEye (41,508), DoS-Slowloris (10,990) |
| **Feb 16 (Fri)** | `Friday-16-02-2018_TrafficForML_CICFlowMeter.csv` | 1,048,574 | 601,802 | 57.39% | DoS-Hulk (461,912), DoS-SlowHTTPTest (139,890) |
| **Feb 21 (Wed)** | `Wednesday-21-02-2018_TrafficForML_CICFlowMeter.csv` | 1,048,575 | 687,742 | 65.59% | DDOS-HOIC (686,012), DDOS-LOIC-UDP (1,730) |
| **Feb 22 (Thu)** | `Thursday-22-02-2018_TrafficForML_CICFlowMeter.csv` | 1,048,566 | 362 | 0.03% | Brute Force - Web (249), Brute Force - XSS (79), SQL Injection (34) |
| **Feb 23 (Fri)** | `Friday-23-02-2018_TrafficForML_CICFlowMeter.csv` | 1,048,575 | 566 | 0.05% | Brute Force - Web (362), Brute Force - XSS (151), SQL Injection (53) |
| **Feb 28 (Wed)** | `Wednesday-28-02-2018_TrafficForML_CICFlowMeter.csv` | 613,071 | 68,871 | 11.23% | Infiltration (68,871) |
| **Mar 02 (Fri)** | `Friday-02-03-2018_TrafficForML_CICFlowMeter.csv` | 1,048,575 | 286,191 | 27.29% | Bot (286,191) |

### Integrity Findings:
- **Timestamp Format Consistency:** All raw CSV files encode timestamps in `DD/MM/YYYY HH:MM:SS` format. Parsing with `dayfirst=True` correctly places dates in February and March 2018.
- **Repeated Header Detection:** Occasional duplicate header lines embedded in raw records (e.g. `Label == "Label"`) were identified and cleanly eliminated.
- **Missing & Infinite Values:** Flow duration, byte rate, and packet rate contained occasional `inf`, `-inf`, and `NaN` values resulting from zero-duration flow division. These were replaced and imputed appropriately.
- **Label Normalization:** Binary target mapping properly separates `Benign` from malicious traffic across all 10 attack classes.

---

## 2. Temporal Network State Aggregation & Continuity Analysis

### 2.1 The Dropped Windows Phenomenon
In the standard pipeline, traffic is grouped into 30-second windows ($W = 30\text{s}$) and aggregated into 24 summary features. However, applying `.dropna()` on resampled buckets discards all windows with zero network flows.

| Day | Active Time Span | Theoretical 30s Windows | Retained Windows | Dropped Empty Windows | Fragmented Runs | Timestamp Gaps |
|---|---:|---:|---:|---:|---:|---:|
| **Feb 14** | 12.00 hrs | 1,440 | 1,086 | 354 (24.6%) | 2 | 1 |
| **Feb 15** | 12.00 hrs | 1,440 | 1,144 | 296 (20.6%) | 2 | 1 |
| **Feb 16** | 11.96 hrs | 1,435 | 265 | **1,170 (81.5%)** | **123** | **122** |
| **Feb 21** | 8.79 hrs | 1,056 | 308 | **748 (70.8%)** | **29** | **28** |
| **Feb 22** | 12.00 hrs | 1,440 | 1,097 | 343 (23.8%) | 2 | 1 |
| **Feb 23** | 12.00 hrs | 1,440 | 1,112 | 328 (22.8%) | 2 | 1 |
| **Feb 28** | 12.00 hrs | 1,440 | 1,138 | 302 (21.0%) | 2 | 1 |
| **Mar 02** | 12.00 hrs | 1,440 | 1,048 | 392 (27.2%) | 2 | 1 |
| **TOTAL** | **92.75 hrs** | **11,131** | **7,198** | **3,933 (35.3%)** | **164** | **156** |

### 2.2 Impact of Fragmentation on Attack Onsets
Because sequences are strictly forbidden from crossing gaps (`diff().ne(WINDOW).cumsum()`), any transition that occurs across an empty window boundary is discarded.
- **Case Example (Feb 21 DDoS):** A period of inactivity preceded the DDoS attack. Dropping the empty windows placed the transition point right at a gap boundary. As a result, the continuous sequence generator extracted 48 benign sequences and 97 attack sequences, but **0 attack onset transitions**.
- **Imputation vs Dropping:** In an operational network, 30 seconds with no recorded flow is an empirical state of zero traffic (benign), not missing data. Imputing zero-activity states would preserve continuous timelines and rescue discarded onset transitions.

---

## 3. Attack Episode Anatomy & Dynamics

The audit classified every contiguous block of attack states into **isolated episodes** (duration = 1 window, flanked by benign states) vs **sustained episodes** (duration $\ge 2$ windows).

```text
Volumetric Flood (Feb 14, 15, 16, 21, 28, Mar 02):
Benign [0, 0, 0] --------> Attack [1, 1, 1, 1, 1, 1, 1, 1, 1, ... 300 windows] --------> Benign [0, 0]
                            ^ Only 1 Onset                                                ^ 1 Termination

Pulsing Web Attacks (Feb 22, Feb 23):
[0] -> [1] -> [0] -> [1] -> [0] -> [1] -> [0] -> [1] -> [0] -> [1] ...
       ^ 94 onsets on Feb 22 due to 30-second flickering!
```

### Episode Audit Summary:

| Traffic Day | Attack States | Onsets | Terminations | Total Episodes | Isolated Episodes (1 state) | Sustained Episodes ($\ge 2$ states) | Max Episode Duration |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Feb 14** | 380 | 2 | 2 | 2 | 0 | 2 | 190.0 mins |
| **Feb 15** | 118 | 5 | 5 | 5 | 1 | 4 | 48.5 mins |
| **Feb 16** | 101 | 1 | 0 | 2 | 0 | 2 | 50.5 mins |
| **Feb 21** | 115 | 1 | 0 | 2 | 0 | 2 | 57.5 mins |
| **Feb 22** | 129 | 103 | 103 | 103 | **94 (91.3%)** | 9 | 4.5 mins |
| **Feb 23** | 196 | 90 | 90 | 90 | **64 (71.1%)** | 26 | 13.0 mins |
| **Feb 28** | 266 | 2 | 2 | 2 | 0 | 2 | 66.5 mins |
| **Mar 02** | 684 | 1 | 1 | 2 | 0 | 2 | 171.0 mins |
| **Total** | **1,989** | **205** | **203** | **208** | **159** | **49** | — |

### Scientific Implications:
1. **The Source of Onset Concentration:** 158 of the 159 isolated attack spikes in the entire dataset occur on Feb 22 and Feb 23. This is not because those days experienced 158 separate attack campaigns, but because automated web scanners (brute force, XSS, SQL injection) send sporadic HTTP requests separated by minutes of idle time.
2. **Persistence Effectiveness:** On days with sustained episodes (Feb 14, 21, Mar 02), the persistence baseline achieves near-perfect F1 (0.998 to 1.000). On days with isolated flickering episodes (Feb 22), persistence drops to F1 = 0.2016 because the state flips back and forth every window.

---

## 4. Cross-Day Distribution Shift & Ablation Dynamics

### 4.1 Training Day Ablation (Fixed Test Day: Feb 22 Web Attacks)
To investigate how heterogeneous attack modalities interact during training, models were trained on subsets of training days and evaluated on the fixed Feb 22 test day:

| Training Configuration | Train Samples | Attack Modalities in Train | F1 | Recall | True Positives (of 129) | False Positive Rate |
|---|---:|---|---:|---:|---:|---:|
| **Feb 15 only** | 1,124 | DoS Slowloris, GoldenEye | **0.2813** | **0.4264** | **55** | 0.2184 |
| **Feb 14 + Feb 15** | 2,190 | + FTP/SSH Brute Force | 0.0541 | 0.0310 | 4 | 0.0158 |
| **Feb 14 + Feb 15 + Feb 16** | 2,274 | + DoS Hulk flood | 0.0400 | 0.0233 | 3 | 0.0190 |

### Critical Takeaway:
Adding volumetric flooding days (Feb 14 and Feb 16) causes the tree ensembles to split on extreme packet and byte volumes ($10^6$ bytes/sec). As a result, the model becomes blind to low-volume web probes ($10^2$ bytes/sec), causing recall on Feb 22 to collapse from 42.6% down to 2.3%.

### 4.2 Test-Set Distribution Shift on March 02 (Botnet)
On the expanded test set (March 02), Botnet traffic causes XGBoost (threshold 0.50) to predict all zeros (Recall = 0.0000, F1 = 0.0000), while Persistence Baseline scores 0.9985 F1. This empirically demonstrates that standard models trained on DoS and Brute Force fail to generalize across days when face with unseen botnet behaviors.

---

## 5. Answers to Core Research Questions (Phase 2)

| Research Question | Empirical Finding |
|---|---|
| **Can temporal network behavior predict upcoming attacks?** | Current next-state models rely almost exclusively on attack autocorrelation (persistence). When evaluating true transition (onset forecasting), performance drops to exploratory levels (F1 $\approx$ 0.17, PR-AUC = 0.12). |
| **Does historical history improve over current state?** | Yes, in onset forecasting: first-to-last feature delta ($S_t - S_{t-9}$) outperforms single-window features (PR-AUC 0.1201 vs 0.0699). |
| **Are attack progression patterns learnable across categories?** | Extremely difficult under naive pooling. Training on volumetric attacks destroys sensitivity to low-intensity attacks due to severe feature scale disparity. |
| **Does the data support multi-horizon rollouts?** | Yes, but multi-horizon prediction must focus on predicting duration and intensity rather than binary next-step persistence. |

---

## 6. Phase 2 Recommendations for Phase 3 & Phase 4

1. **Adopt Zero-Traffic Imputation for Inactive Windows:**
   Replace `.dropna()` in state aggregation with zero-activity imputation (`total_packets=0`, `total_bytes=0`, `is_attack=0`). This will eliminate 156 artificial gaps, preserve continuous 12-hour timelines, and recover discarded attack onset transitions.
2. **Decouple Volumetric Floods from Stealthy Web Attacks:**
   Separate evaluation protocols or normalize traffic volumes by logarithmic scaling and per-host metrics so that high-volume floods do not overwhelm low-volume attack signals.
3. **Formalize the Onset Risk-Set Protocol:**
   Always report onset forecasting strictly on the eligible risk set ($\text{last\_attack} == 0$). Never report whole-sample accuracy or F1 as evidence of onset prediction.
4. **Implement Adaptive Thresholding:**
   Evaluate precision-recall curves and optimize decision thresholds on validation sets rather than relying on an arbitrary 0.50 cutoff.
5. **Move Toward Multi-Step Progression & Intensity Targets:**
   Instead of predicting only $t+1$ (where persistence dominates), predict horizons $t+2, t+5, t+10$ (1 to 5 minutes ahead) and forecast continuous attack intensity ($y_\text{intensity} \in [0, 1]$).
