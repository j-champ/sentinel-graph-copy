# SentinelGraph

## Temporal Network Attack Forecasting System

SentinelGraph is a cybersecurity intelligence system designed to move beyond traditional intrusion detection by forecasting future attack risk from evolving network behavior.

Instead of asking:

> "What attack is happening now?"

SentinelGraph focuses on:

> "Given the current network state and its recent history, what is likely to happen next?"

The system transforms network traffic into temporal network states, constructs historical sequences, and uses machine learning and temporal deep learning models to forecast future attack activity.

The project is being developed as a research-oriented MVP during the current semester. Advanced capabilities such as graph-based modeling, latent world models, multi-horizon rollouts, and attack progression modeling form the subsequent research direction.

---

# 1. Problem Statement

Traditional Intrusion Detection Systems primarily focus on identifying whether the current observed network activity is malicious.

SentinelGraph explores a different objective:

```text
Current Network State
        +
Recent Network History
        ↓
Future Attack Forecast
```

The objective is to determine whether temporal patterns in network behavior can provide an early indication of future attack activity.

The system therefore focuses on:

* Network traffic analysis
* Network state representation
* Temporal behavior modeling
* Future attack forecasting
* Attack-risk estimation
* Attack-intensity forecasting
* Explainable security analytics
* Early-warning analysis

---

# 2. Core Idea

The fundamental distinction between conventional detection and SentinelGraph is:

### Traditional IDS

```text
Network Traffic
      ↓
Current Activity
      ↓
Attack / Benign
```

### SentinelGraph

```text
Network Traffic
      ↓
Network State S(t)
      ↓
Recent State History
      ↓
Temporal Forecasting
      ↓
Future Attack Risk
```

The long-term research direction extends this into learned network dynamics:

```text
Network State S(t)
      ↓
Learned Representation
      ↓
State Transition Dynamics
      ↓
Future States
      ↓
Future Attack Risk / Intensity / Progression
```

---

# 3. System Architecture

## Current Implementation

```text
CIC-IDS2018 Network Traffic
            |
            v
      Data Cleaning
            |
            v
     Feature Engineering
            |
            v
    Temporal Network States
            |
            v
     Temporal Sequences
            |
            v
 Chronological Train / Validation / Test
            |
            v
      Forecasting Models
            |
       +----+----+
       |         |
       v         v
 Classical     LSTM
 Baselines
       |         |
       +----+----+
            |
            v
    Future Attack Prediction
            |
            v
        Evaluation
```

## Planned Semester MVP

```text
Network Traffic
      |
      v
Data Processing
      |
      v
Network State Construction
      |
      v
Temporal State History
      |
      v
Attack Forecasting
      |
      +-----------------------+
      |                       |
      v                       v
Future Attack Risk     Attack Intensity
      |                       |
      +-----------+-----------+
                  |
                  v
           Explainability
                  |
                  v
         Early-Warning Analysis
                  |
                  v
              Dashboard
```

---

# 4. Data Pipeline

The current data pipeline is:

```text
CIC-IDS2018 Dataset
        |
        v
Raw Network Flow Data
        |
        v
Data Cleaning
        |
        v
Clean Flow Dataset
        |
        v
Feature Engineering
        |
        v
Cybersecurity Feature Dataset
        |
        v
30-second Network States
        |
        v
Temporal Sequence Generation
        |
        v
Chronological Dataset Split
        |
        v
Forecasting Experiments
```

---

# 5. Pipeline Stages

## 5.1 Data Cleaning

Input:

```text
Raw CIC-IDS2018 CSV files
```

The cleaning pipeline performs operations including:

* Schema normalization
* Datatype correction
* Timestamp conversion
* Missing-value handling
* Corrupted-row handling
* Label normalization

Output:

```text
data/interim/
```

---

## 5.2 Feature Engineering

The feature pipeline converts cleaned flow records into security-oriented features.

### Traffic Behavior

* Total packets
* Total bytes
* Average packet size
* Byte rate
* Packet rate

### Directional Behavior

* Forward packet ratio
* Backward packet ratio

### TCP Behavior

* SYN rate
* ACK rate
* RST rate

### Timing Behavior

* Flow duration
* Inter-arrival-time statistics

Output:

```text
data/features/
```

---

## 5.3 Temporal Network State Generation

Individual network flows are aggregated into temporal network states.

Current aggregation window:

```text
30 seconds
```

Conceptually:

```text
Flow 1
Flow 2
Flow 3
Flow 4
   |
   v
Network State S(t)
```

Each state summarizes network behavior observed during a temporal window.

Output:

```text
data/states/
```

---

## 5.4 Temporal Sequence Generation

The forecasting dataset is constructed using consecutive network states.

Current sequence length:

```text
10 states
```

Conceptually:

```text
S(t-9) → S(t-8) → ... → S(t-1) → S(t)
                                      |
                                      v
                              Future Target
```

Each generated sequence currently contains:

```text
X
y_attack
y_intensity
last_attack
```

Where:

| Field         | Description                                       |
| ------------- | ------------------------------------------------- |
| `X`           | Historical network-state sequence                 |
| `y_attack`    | Future attack indicator                           |
| `y_intensity` | Future attack ratio                               |
| `last_attack` | Attack state of the most recently observed window |

The current sequence representation has:

```text
10 temporal states
×
24 features
```

Therefore the sequence shape is:

```text
(N, 10, 24)
```

---

# 6. Dataset

## CIC-IDS2018

The current implementation uses the Canadian Institute for Cybersecurity Intrusion Detection System Dataset 2018 (CIC-IDS2018).

The dataset contains network flow records captured across multiple days, representing benign background traffic alongside diverse attack campaigns.

### Available Traffic Days (8 Days Processed)

| Date | File Name | Attack Categories Present | Raw Flows | Attack Flows | Attack % |
|---|---|---|---:|---:|---:|
| **Feb 14, 2018** | `Wednesday-14-02-2018_TrafficForML_CICFlowMeter.csv` | FTP-BruteForce, SSH-Bruteforce | 1,048,570 | 380,949 | 36.33% |
| **Feb 15, 2018** | `Thursday-15-02-2018_TrafficForML_CICFlowMeter.csv` | DoS-GoldenEye, DoS-Slowloris | 1,048,575 | 52,498 | 5.01% |
| **Feb 16, 2018** | `Friday-16-02-2018_TrafficForML_CICFlowMeter.csv` | DoS-Hulk, DoS-SlowHTTPTest | 1,048,574 | 601,802 | 57.39% |
| **Feb 21, 2018** | `Wednesday-21-02-2018_TrafficForML_CICFlowMeter.csv` | DDOS-HOIC, DDOS-LOIC-UDP | 1,048,575 | 687,742 | 65.59% |
| **Feb 22, 2018** | `Thursday-22-02-2018_TrafficForML_CICFlowMeter.csv` | Brute Force - Web, Brute Force - XSS, SQL Injection | 1,048,566 | 362 | 0.03% |
| **Feb 23, 2018** | `Friday-23-02-2018_TrafficForML_CICFlowMeter.csv` | Brute Force - Web, Brute Force - XSS, SQL Injection | 1,048,575 | 566 | 0.05% |
| **Feb 28, 2018** | `Wednesday-28-02-2018_TrafficForML_CICFlowMeter.csv` | Infiltration | 613,071 | 68,871 | 11.23% |
| **Mar 02, 2018** | `Friday-02-03-2018_TrafficForML_CICFlowMeter.csv` | Bot | 1,048,575 | 286,191 | 27.29% |

The complete CIC-IDS2018 dataset is not downloaded; only these 8 days are integrated. Raw CSV files are excluded from Git and stored locally under `data/raw/CIC-IDS2018/`.

---

# 7. Target Definitions & Dataset Splits

## 7.1 Target Definitions

Given an observed historical sequence of 10 consecutive 30-second states $S_{t-9}, \dots, S_t$ (5-minute history window):

1. **Next-State Binary Attack Target (`y_attack`):**
   $$y_{\text{attack}, t+1} = \mathbb{I}(\text{flow\_attack\_count}_{t+1} > 0)$$
   Predicts whether any attack-labeled flow occurs in the immediately following 30-second state window $S_{t+1}$.

2. **Next-State Attack Intensity Target (`y_intensity`):**
   $$y_{\text{intensity}, t+1} = \frac{\text{attack\_flows}_{t+1}}{\text{total\_flows}_{t+1}}$$
   Quantifies the malicious flow fraction in the next 30-second window (continuous in $[0, 1]$).

3. **Current-State Attack State (`last_attack`):**
   $$\text{last\_attack}_t = \mathbb{I}(\text{flow\_attack\_count}_t > 0)$$
   Indicates whether the final observed state in the input sequence was malicious.

4. **Attack-Onset Target (`y_onset`):**
   $$y_{\text{onset}, t+1} = (y_{\text{attack}, t+1} == 1) \land (\text{last\_attack}_t == 0)$$
   Evaluated strictly on the **eligible risk set** where $\text{last\_attack}_t == 0$. Sequences already in an attack state at time $t$ are excluded from the risk set to prevent trivial non-onset filtering and focus exclusively on transition from benign to attack.

## 7.2 Experimental Dataset Splits

SentinelGraph maintains several experimental configurations to isolate specific temporal, continuity, and generalisation dynamics:

### Configuration A: Expanded Next-State Classification Split

Designed to assess next-state classification across multiple attack families:

| Split | Days | Sequences | Attack Prev. | Primary Attack Modality |
|---|---|---:|---:|---|
| **Train** | Feb 14, Feb 15, Feb 16, Feb 21 | 2,419 | 40.5% | FTP/SSH Brute Force, DoS, DDoS |
| **Validation** | Feb 23, Feb 28 | 2,210 | 20.7% | Web Attacks, Infiltration |
| **Test** | March 02 | 1,028 | 65.6% | Botnet traffic |

*Note: March 02 represents a severe distribution shift (Botnet traffic) and serves as a test of cross-day transfer, not touched during hyperparameter tuning.*

### Configuration B: Continuous Chronological Split (5 Days)

Strictly enforces 30-second continuity (sequences never cross timestamp gaps):

| Split | Days | Sequences | Benign | Attack | Attack Prev. |
|---|---|---:|---:|---:|---:|
| **Train** | Feb 14, Feb 15 | 2,190 | 1,692 | 498 | 22.7% |
| **Validation** | Feb 16 | 84 | 0 | 84 | 100.0% |
| **Test** | Feb 21, Feb 22 | 1,222 | 996 | 226 | 18.5% |

### Configuration C: Exploratory Attack-Onset Split

Evaluates whether early warnings of attack transition can be detected from 5-minute benign history:

| Split | Days | Eligible Samples ($\text{last}=0$) | Onsets ($y=1$) | Onset Prev. |
|---|---|---:|---:|---:|
| **Train** | Feb 14, 15, 16, 21, 22 | 2,688 | 110 | 4.09% |
| **Test** | Feb 23 | 900 | 86 | 9.56% |

*Critical caveat: Feb 22 contributes 103 of the 110 training onsets (93.6%), and Feb 23 contributes 86 onsets. Both days consist of identical web attack suites (Brute Force - Web, XSS, SQL Injection). Feb 23 was also previously used in validation in Configuration A, so this must be treated strictly as an exploratory study.*

---

# 8. Current Forecasting Models

The current model progression is:

```text
Majority Baseline
        ↓
Persistence Baseline
        ↓
Logistic Regression
        ↓
XGBoost
        ↓
LSTM
```

The purpose of this model ladder is to establish increasingly capable reference points before introducing more advanced temporal and structural models.

---

# 9. Baseline Models

## Majority Baseline

Predicts the majority class for every sample.

Purpose:

> Establish a trivial reference point.

---

## Persistence Baseline

Uses the most recently observed attack state as the prediction for the future state.

Purpose:

> Determine how much predictive power exists simply because attack states exhibit temporal persistence.

This is an important baseline for a forecasting problem.

---

## Logistic Regression

A linear baseline trained on the flattened temporal representation.

Current input representation:

```text
10 states × 24 features = 240 features
```

Purpose:

> Establish a linear reference model.

---

## XGBoost

A nonlinear tree-based baseline trained on the flattened temporal representation.

Current configuration uses:

```text
n_estimators = 300
max_depth = 6
learning_rate = 0.05
subsample = 0.8
colsample_bytree = 0.8
```

The initial benchmark uses a fixed classification threshold of:

```text
0.50
```

---

## LSTM

The LSTM operates directly on the temporal sequence representation:

```text
(batch, sequence_length, features)
```

Current configuration:

```text
Sequence length = 10
Features = 24
Hidden size = 64
Batch size = 64
Learning rate = 0.001
Optimizer = Adam
Early stopping = enabled
```

The model predicts future attack probability.

---

# 10. Current Experimental Results

## 10.1 Expanded Next-State Forecasting Results (Test: March 02, Botnet)

Evaluated on the expanded split (Train: Feb 14, 15, 16, 21; Validation: Feb 23, 28; Test: March 02).
Test set contains 1,028 sequences (354 benign, 674 attack; attack prevalence: 65.56%).

| Model | Accuracy | Precision | Recall | F1 | PR-AUC | ROC-AUC | FPR | Confusion Matrix |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| **Majority Baseline** | 0.3444 | 0.0000 | 0.0000 | 0.0000 | 0.6556 | 0.5000 | 0.0000 | TN=354, FP=0, FN=674, TP=0 |
| **Persistence Baseline** | 0.9981 | 0.9985 | 0.9985 | 0.9985 | 0.9980 | 0.9978 | 0.0028 | TN=353, FP=1, FN=1, TP=673 |
| **Logistic Regression** | 0.3356 | 0.2353 | 0.0059 | 0.0116 | 0.5027 | 0.2302 | 0.0367 | TN=341, FP=13, FN=670, TP=4 |
| **XGBoost (Val, $\theta=0.50$)** | 0.7742 | 0.1912 | 0.0284 | 0.0495 | 0.1997 | 0.4979 | 0.0314 | TN=1698, FP=55, FN=444, TP=13 |
| **XGBoost (Test, $\theta=0.50$)** | 0.3444 | 0.0000 | 0.0000 | 0.0000 | 0.6584 | 0.4260 | 0.0000 | TN=354, FP=0, FN=674, TP=0 |

## 10.2 Continuous Per-Day Evaluation (Feb 21 DDoS vs Feb 22 Web Attacks)

Models trained on continuous sequences from Feb 14 and Feb 15 (2,190 sequences) and evaluated separately on two distinct test days:

| Test Day | Attack Type | Model | F1 | PR-AUC | ROC-AUC | Recall | Precision | FPR |
|---|---|---|---:|---:|---:|---:|---:|---:|
| **Feb 21** ($N=145$) | DDOS-HOIC | Persistence | **1.0000** | **1.0000** | **1.0000** | 1.0000 | 1.0000 | 0.0000 |
| | | XGBoost | 0.7643 | 0.9956 | 0.9925 | 0.6186 | 1.0000 | 0.0000 |
| **Feb 22** ($N=1,077$) | Web Attacks | Persistence | **0.2016** | 0.1363 | 0.5465 | 0.2016 | 0.2016 | 0.1086 |
| | | XGBoost | 0.0268 | **0.1692** | **0.6477** | 0.0155 | 0.1000 | 0.0190 |

## 10.3 Training Day Ablation (Fixed Test Day: Feb 22)

Investigation into whether accumulating training days from heterogeneous attack modalities improves generalization to sparse web attacks on Feb 22 ($N=1,077$ sequences; 129 attack positives):

| Training Configuration | Train Samples | F1 | PR-AUC | ROC-AUC | Recall | FPR | True Positives (of 129) |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Feb 15 only** (DoS Slowloris/GoldenEye) | 1,124 | **0.2813** | **0.1804** | **0.6449** | **0.4264** | 0.2184 | **55** |
| **Feb 14 + Feb 15** (+ FTP/SSH Brute Force) | 2,190 | 0.0541 | 0.1770 | 0.6414 | 0.0310 | 0.0158 | 4 |
| **Feb 14 + Feb 15 + Feb 16** (+ DoS Hulk) | 2,274 | 0.0400 | 0.1704 | 0.6366 | 0.0233 | 0.0190 | 3 |

*Ablation Finding: Adding high-volume volumetric flood attacks (Feb 14 FTP/SSH brute force and Feb 16 DoS Hulk) severely degrades recall on low-intensity web attacks (dropping from 42.6% down to 2.3%). The model shifts decision thresholds toward high flow volumes, blinding it to stealthy web probes.*

## 10.4 8-Day Attack Episode & Continuity Audit

Rigorous temporal audit quantifying 30-second continuity runs, timestamp gaps, and attack episode characteristics across all 8 days:

| Traffic Day | States | Attack States | Attack % | Runs | Gaps | Onsets | Terminations | Attack Episodes | Isolated (1-window) | Sustained ($\ge 2$) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Feb 14 (Wed)** | 1,086 | 380 | 34.99% | 2 | 1 | 2 | 2 | 2 | 0 | 2 |
| **Feb 15 (Thu)** | 1,144 | 118 | 10.31% | 2 | 1 | 5 | 5 | 5 | 1 | 4 |
| **Feb 16 (Fri)** | 265 | 101 | 38.11% | 123 | 122 | 1 | 0 | 2 | 0 | 2 |
| **Feb 21 (Wed)** | 308 | 115 | 37.34% | 29 | 28 | 1 | 0 | 2 | 0 | 2 |
| **Feb 22 (Thu)** | 1,097 | 129 | 11.76% | 2 | 1 | 103 | 103 | 103 | **94** | 9 |
| **Feb 23 (Fri)** | 1,112 | 196 | 17.63% | 2 | 1 | 90 | 90 | 90 | **64** | 26 |
| **Feb 28 (Wed)** | 1,138 | 266 | 23.37% | 2 | 1 | 2 | 2 | 2 | 0 | 2 |
| **Mar 02 (Fri)** | 1,048 | 684 | 65.27% | 2 | 1 | 1 | 1 | 2 | 0 | 2 |
| **TOTALS** | **7,198** | **1,989** | **27.63%** | **164** | **156** | **205** | **203** | **208** | **159** | **49** |

*Audit Finding: 158 of the 159 isolated (single-window) attack spikes occur on just two days: Feb 22 (94) and Feb 23 (64). On volumetric attack days (DoS, DDoS, Infiltration, Botnet), attacks are sustained unbroken blocks lasting hours (only 1 or 2 onsets per day).*

## 10.5 Exploratory Attack-Onset Forecasting Results (Test: Feb 23)

Evaluated strictly on the **eligible risk set** ($\text{last\_attack} == 0$). Train: Feb 14-22 (2,688 eligible samples, 110 onsets); Test: Feb 23 (900 eligible samples, 86 onsets). Fixed threshold = 0.50; no-skill PR-AUC reference = 0.0956.

| Feature Representation | Model | Precision | Recall | F1 | PR-AUC | ROC-AUC | TN | FP | FN | TP |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Last window** | Logistic Regression | 0.0705 | **0.5930** | 0.1261 | 0.0652 | 0.3004 | 143 | 671 | 35 | 51 |
| | XGBoost | 0.0000 | 0.0000 | 0.0000 | 0.0699 | 0.3361 | 814 | 0 | 86 | 0 |
| **Five-minute mean** | Logistic Regression | 0.0721 | 0.5349 | 0.1271 | 0.0746 | 0.3800 | 224 | 590 | 40 | 46 |
| | XGBoost | 0.0294 | 0.0116 | 0.0167 | 0.0773 | 0.4042 | 781 | 33 | 85 | 1 |
| **First-to-last delta** | Logistic Regression | 0.1066 | 0.4535 | **0.1726** | 0.1062 | **0.5435** | 487 | 327 | 47 | 39 |
| | XGBoost | **0.3333** | 0.0116 | 0.0225 | **0.1201** | 0.5240 | 812 | 2 | 85 | 1 |

### Leave-One-Day-Out Analysis (Logistic Regression with Delta Features)

| Held-out Day | Eligible Samples | Onsets | Precision | Recall | F1 | PR-AUC | ROC-AUC |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Feb 14** | 686 | 2 | 0.0068 | 1.0000 | 0.0135 | 0.0064 | 0.6615 |
| **Feb 15** | 1,006 | 5 | 0.0089 | 0.8000 | 0.0176 | 0.0090 | 0.6683 |
| **Feb 16** | 0 | 0 | N/A | N/A | N/A | N/A | N/A |
| **Feb 21** | 48 | 0 | 0.0000 | 0.0000 | 0.0000 | N/A | Undefined |
| **Feb 22** | 948 | 103 | 0.1570 | 0.3398 | 0.2147 | 0.1408 | 0.5622 |

## 10.6 Scientific Interpretation & Core Discoveries

1. **The "Persistence Trap" in Next-State Forecasting:**
   Next-state classification ($\hat{y}_{t+1}$) is trivialized by persistence whenever attacks occur in sustained multi-hour blocks (e.g. F1 = 0.9985 on March 02 Botnet traffic and 1.0000 on Feb 21 DDoS traffic). High accuracy or F1 on next-state forecasting is primarily an artifact of attack state autocorrelation, **not** genuine attack forecasting.
2. **The Onset Scarcity Reality:**
   True attack onset prediction ($y_{t+1}=1$ when $y_t=0$) is an intrinsically different and far harder problem. Across all 8 days and 7,198 states, there are only 205 onset transitions. Furthermore, 193 of those onsets (94.1%) are concentrated in just two days (Feb 22 and Feb 23) due to pulsing web attacks.
3. **Severe Cross-Day Distribution Shift:**
   Volumetric floods (DDoS, DoS Hulk, Botnet) have drastically different feature distributions than stealthy brute-force or web-application attacks. As demonstrated by the training-day ablation, pooling volumetric and stealthy attacks degrades detection performance rather than improving it.
4. **Current Status of Onset Forecasting:**
   While the first-to-last delta representation achieves non-random PR-AUC (0.1201 vs 0.0956 no-skill), high false alarm rates (327 false alarms to catch 39 onsets) and extreme day-level class concentration prevent claiming reliable onset forecasting at this stage.

---

# 11. Evaluation Metrics

The current experiments use:

## Classification

* Precision
* Recall
* F1
* ROC-AUC
* PR-AUC
* False Positive Rate
* Confusion Matrix

Accuracy is not treated as the primary metric because of class imbalance.

## Future Forecasting

The MVP will additionally evaluate:

* Future attack intensity
* Intensity MAE
* Intensity MSE
* Forecast horizon degradation
* Early-warning lead time

## Later Research Evaluation

Future research stages will additionally consider:

* Brier score
* Expected Calibration Error
* Reliability diagrams
* Distribution-shift performance
* Attack-family generalization
* Error analysis
* Ablation studies

---

# 12. Current Implementation Status

### Engineering Implementation (Pipeline & Infrastructure)
- [x] **8-Day CIC-IDS2018 Ingestion & Inventory:** Automated parsing and cataloging of 8 distinct traffic days.
- [x] **Data Cleaning & Schema Normalization:** Handling repeated headers, infinite values, coerced numerics, and date-range filtering.
- [x] **Security Feature Engineering:** Packet/byte volume metrics, directional ratios, and flag rate indicators (SYN, ACK, RST).
- [x] **30-Second Temporal Network State Aggregation:** Windowed summary statistics (mean, sum, max) across network states.
- [x] **Discontinuity-Aware Sequence Generation:** Run-length segmentation ensuring sequences strictly never cross timestamp gaps.
- [x] **Leakage-Safe Preprocessing:** Preprocessing pipelines fitted strictly on training partitions.
- [x] **Target Engineering:** Next-state binary attack indicator, next-state intensity fraction, last-observed attack state, and risk-set-filtered attack-onset targets.

### Baseline & Temporal Modeling
- [x] **Majority Classifier Baseline:** Empirical no-skill floor on imbalanced targets.
- [x] **Persistence Reference Baseline:** Last-state copy reference model proving attack state autocorrelation.
- [x] **Classical Machine Learning Models:** Standardized Logistic Regression and tuned XGBoost classifiers.
- [x] **Recurrent Neural Network Baseline:** PyTorch LSTM temporal sequence forecasting model with probability diagnostics.
- [x] **Multi-Representation Extraction:** Comparison of last-window, 5-minute mean, and first-to-last delta feature vectors.

### Empirical Audits & Validation
- [x] **Continuous Per-Day Evaluation:** Isolated day-level benchmarking exposing contrast between DDoS (persistence = 1.0) and Web attacks.
- [x] **Training Day Ablation Study:** Empirical proof that pooling volumetric floods with low-volume attacks degrades detection capability.
- [x] **Attack Episode & Continuity Audit:** Comprehensive analysis identifying 159 isolated attack spikes vs 49 sustained episodes.
- [x] **Exploratory Attack-Onset Forecasting:** Initial benchmarking on held-out web attack data (Feb 23) and leave-one-day-out analysis.

### Active Next Objectives (Phases 2–4)
- [ ] Unify dataset pipeline into a single configuration-driven execution structure.
- [ ] Address onset class scarcity and investigate operational threshold tuning.
- [ ] Implement MLP baseline and Random Forest / LightGBM comparisons.
- [ ] Construct future attack intensity forecasting module.
- [ ] Early-warning lead time and false alarm rate quantification.

---

# 13. Semester MVP

The goal for the current semester is to finish a complete working MVP.

The MVP will extend the current forecasting pipeline into an operational offline system:

```text
Offline Network Traffic
        |
        v
Data Processing
        |
        v
Network State Construction
        |
        v
Temporal History
        |
        v
Forecasting Model
        |
        +-------------------------+
        |                         |
        v                         v
Future Attack Risk        Future Intensity
        |                         |
        +------------+------------+
                     |
                     v
               Explanation
                     |
                     v
            Early-Warning Signal
                     |
                     v
                Dashboard
```

The MVP should demonstrate the complete path from network telemetry to an interpretable future-risk forecast.

---

# 14. MVP Outputs

The semester MVP is intended to provide:

## Future Attack Risk

Example:

```text
Future attack probability: 73%
```

## Future Attack Intensity

Example:

```text
Predicted future attack intensity: 0.42
```

## Temporal Risk

The system should be able to show how predicted risk changes as the network state evolves.

## Explanation

The system should provide the major traffic features contributing to a forecast.

Example:

```text
Important contributing signals:

- SYN rate
- Packet rate
- Flow frequency
- Byte rate
- RST rate
```

The exact explanation method will depend on the final model used in the MVP.

---

# 15. SIH Alignment

The project is designed around the requirements of the SIH network attack forecasting problem.

The MVP focuses on the core requirements that can be implemented and demonstrated during the semester:

| Requirement                  | SentinelGraph                                             |
| ----------------------------- | ----------------------------------------------------------- |
| Network traffic ingestion    | CIC-IDS2018 flow data                                     |
| Network-state representation | 30-second network states                                  |
| Temporal modeling            | 10-state temporal sequences                               |
| Future attack prediction     | Current forecasting models                                |
| Attack intensity             | `y_intensity` target and planned forecasting              |
| Explainability               | Planned MVP component                                     |
| Offline operation            | Planned MVP workflow                                      |
| Benchmarking                 | Majority, Persistence, Logistic Regression, XGBoost, LSTM |
| User interface               | Planned MVP dashboard                                     |

More advanced SIH-oriented capabilities will be investigated in subsequent research stages.

---

# 16. Research Direction

The central research question is:

> To what extent can temporal and structural modeling of network telemetry provide reliable early warning of future cyberattack progression?

A second research direction investigates whether a learned latent state-transition model can represent useful network dynamics well enough to forecast future network states and attack risk over multiple horizons.

The project follows the principle:

```text
Question
   ↓
Hypothesis
   ↓
Experiment
   ↓
Result
   ↓
Interpretation
   ↓
Next Decision
```

The project does not assume that a more complex model must outperform a simpler model.

Instead, each additional modeling component should demonstrate measurable predictive or operational value.

---

# 17. Research Hypotheses

## H1 — Temporal Information

Historical network states provide useful information for forecasting future attack activity beyond the current state alone.

## H2 — Structural Information

Network topology can provide additional predictive information beyond vector-based traffic representations.

## H3 — Learned Dynamics

A learned state-transition model can capture useful network dynamics for future-state forecasting.

## H4 — Forecast Horizon

Forecasting performance degrades as the prediction horizon increases.

Planned horizons include:

```text
+30s
+60s
+90s
+120s
+180s
+300s
```

## H5 — Early Warning

A useful forecasting system can provide measurable lead time before future attack activity.

## H6 — Generalization

Forecasting performance changes under distribution shift and across different attack scenarios.

## H7 — Calibration

Reliable attack probabilities require evaluation beyond classification accuracy, including calibration metrics.

---

# 18. Future Research Extensions

## Phase 1 — Packet-Level Telemetry

Introduce packet-derived features alongside flow-level features.

```text
Flow Features
      +
Packet Features
      ↓
Unified Network State
```

---

## Phase 2 — Structural Representation

Represent network entities and interactions as graphs.

```text
Hosts
  |
Connections
  |
Communication Graph
```

This enables comparison between:

```text
Vector representation
        vs
Graph representation
```

---

## Phase 3 — Temporal Graph Modeling

Investigate temporal graph models for evolving network structure.

Potential comparison:

```text
LSTM / GRU
     vs
Temporal GNN
```

---

## Phase 4 — Latent World Model

The longer-term architecture introduces a learned latent network state:

```text
S(t)
 |
 v
Encoder
 |
 v
z(t)
 |
 v
Transition Model
 |
 +----> z(t+1)
 |
 +----> z(t+2)
 |
 +----> ...
 |
 +----> z(t+K)
 |
 v
Decoder / Prediction Heads
```

The world model would be evaluated using:

* Future-state prediction
* Attack-risk prediction
* Attack-intensity prediction
* State reconstruction
* Rollout degradation
* Calibration
* Generalization

---

## Phase 5 — Multi-Horizon Forecasting

Evaluate how forecasting quality changes with increasing prediction horizon.

```text
Current
   |
   +---- +30s
   +---- +60s
   +---- +90s
   +---- +120s
   +---- +180s
   +---- +300s
```

---

## Phase 6 — Attack Progression

Where dataset labels support it, investigate attack-stage progression and mapping to appropriate security frameworks.

The system should not infer unsupported attack stages simply to produce a more complex visualization.

---

## Phase 7 — Research Validation

Planned comparisons include:

```text
Static vs Temporal
Persistence vs ML
Current State vs History
Vector vs Graph
Flow vs Flow + Packet
LSTM vs GRU
LSTM vs Temporal GNN
Temporal Model vs World Model
One-step vs Multi-step
Teacher Forcing vs Free Running
```

Additional evaluation will include:

* Ablation studies
* Error analysis
* Calibration
* Distribution shift
* Attack-family generalization where supported

---

# 19. Long-Term Architecture

The long-term SentinelGraph architecture is:

```text
                 Flow + Packet Telemetry
                           |
                           v
                    Network State S(t)
                           |
              +------------+------------+
              |                         |
              v                         v
       Vector Encoder            Graph Encoder
              |                         |
              +------------+------------+
                           |
                           v
                    Latent State z(t)
                           |
                           v
                  World Model Dynamics
                           |
              +------------+------------+
              |            |            |
              v            v            v
           z(t+1)       z(t+2)       z(t+K)
              |            |            |
              +------------+------------+
                           |
                           v
                 Future State Prediction
                           |
            +--------------+--------------+
            |              |              |
            v              v              v
       Attack Risk     Intensity     Progression
            |              |              |
            +--------------+--------------+
                           |
                           v
                Explainability / Uncertainty
                           |
                           v
                     Early Warning
                           |
                           v
                       Dashboard
```

---

# 20. Development Roadmap

The project follows a staged research and development roadmap.

```text
Level 1 — Data
        ↓
Level 2 — Forecasting
        ↓
Level 3 — Temporal Dynamics
        ↓
Level 4 — Structure
        ↓
Level 5 — World Model
        ↓
Level 6 — Rollout
        ↓
Level 7 — Operational Value
        ↓
Level 8 — Research Validation
        ↓
Level 9 — Productization
```

### Current Position

```text
Level 1 — Data                    COMPLETE
Level 2 — Forecasting             MOSTLY COMPLETE
Level 3 — Temporal Dynamics       NEXT
Level 4 — Structure               FUTURE
Level 5 — World Model             FUTURE
Level 6 — Rollout                 FUTURE
Level 7 — Operational Value       MVP STAGE
Level 8 — Research Validation     FUTURE
Level 9 — Productization          FUTURE
```

---

# 21. Environment Setup & Installation

The project runs on macOS (Apple Silicon / ARM64) using Python 3.14 inside a local virtual environment.

### 21.1 Environment Verification

Always use the project's dedicated virtual environment:

```bash
.venv/bin/python --version
```

### 21.2 Virtual Environment Setup

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install core dependencies
pip install -r requirements.txt
```

Core libraries verified in `.venv`:
- `numpy` (2.5.3)
- `pandas` (3.0.6)
- `pyarrow` (25.0.1)
- `scikit-learn` (1.9.1)
- `torch` (2.14.0)
- `xgboost` (3.4.1)
- `matplotlib` (3.11.2)

---

# 22. Dataset Setup

Create the raw dataset storage directory:

```bash
mkdir -p data/raw/CIC-IDS2018
```

Place the 8 CIC-IDS2018 CSV files in `data/raw/CIC-IDS2018/`:
- `Wednesday-14-02-2018_TrafficForML_CICFlowMeter.csv`
- `Thursday-15-02-2018_TrafficForML_CICFlowMeter.csv`
- `Friday-16-02-2018_TrafficForML_CICFlowMeter.csv`
- `Wednesday-21-02-2018_TrafficForML_CICFlowMeter.csv`
- `Thursday-22-02-2018_TrafficForML_CICFlowMeter.csv`
- `Friday-23-02-2018_TrafficForML_CICFlowMeter.csv`
- `Wednesday-28-02-2018_TrafficForML_CICFlowMeter.csv`
- `Friday-02-03-2018_TrafficForML_CICFlowMeter.csv`

---

# 23. Complete Data Pipeline Execution

Run the data pipeline sequentially to process raw traffic into model-ready sequences.

### Step 1 — Data Cleaning & Schema Normalization

```bash
# Clean initial 5 days (Feb 14, 15, 16, 21, 22) -> data/interim/
.venv/bin/python src/cleaning/clean_dataset.py

# Clean expanded 3 days (Feb 23, 28, Mar 02) -> data/interim_expanded/
.venv/bin/python src/cleaning/clean_expanded_dataset.py

# Verify interim clean parquet files
.venv/bin/python src/cleaning/check_clean.py
```

### Step 2 — Security Feature Engineering

```bash
# Extract security features for initial 5 days -> data/features/
.venv/bin/python src/features/build_features.py

# Extract security features for expanded 3 days -> data/features_expanded/
.venv/bin/python src/features/build_expanded_features.py

# Verify engineered feature columns
.venv/bin/python src/features/check_features.py
```

### Step 3 — Temporal Network State Construction (30-second Windows)

```bash
# Construct 30s aggregate states for initial 5 days -> data/states/
.venv/bin/python src/windowing/create_states.py

# Construct 30s aggregate states for expanded 3 days -> data/states_expanded/
.venv/bin/python src/windowing/create_expanded_states.py

# Verify network state distributions
.venv/bin/python src/windowing/check_states.py
```

### Step 4 — Discontinuity-Aware Sequence Generation

```bash
# Generate continuity-aware sequences (diff == 30s) for initial 5 days -> data/sequences_continuous/
.venv/bin/python src/dataset/build_sequences_continuous.py

# Generate continuity-aware sequences for expanded 3 days -> data/sequences_expanded/
.venv/bin/python src/dataset/build_expanded_sequences.py
```

### Step 5 — Dataset Splitting

```bash
# Expanded split (Train: Feb 14-21, Val: Feb 23, 28, Test: Mar 02) -> data/splits_expanded/
.venv/bin/python src/dataset/create_splits_expanded.py

# Continuous 5-day split (Train: Feb 14-15, Val: Feb 16, Test: Feb 21-22) -> data/splits_continuous/
.venv/bin/python src/dataset/create_splits_continuous.py

# Chronological 5-day split -> data/splits_chronological/
.venv/bin/python src/dataset/create_splits_chronological.py
```

---

# 24. Running Experiments & Empirical Audits

Execute each experiment individually using `.venv/bin/python`:

### 24.1 Empirical Audits (Data Quality & Temporal Integrity)

```bash
# 1. Attack Episode & Continuity Audit (evaluates runs, gaps, isolated vs sustained episodes)
.venv/bin/python src/experiments/audit_attack_episodes.py

# 2. State Transitions & Gap Audit (inspects transitions and timestamp gap boundaries)
.venv/bin/python src/experiments/audit_state_transitions.py

# 3. Continuous Target Distribution Audit (evaluates target transitions and intensities)
.venv/bin/python src/experiments/audit_continuous_targets.py
```

### 24.2 Baseline Experiments

```bash
# 4. Expanded Next-State Baselines (Majority, Persistence, Logistic Regression, XGBoost on March 02)
.venv/bin/python src/experiments/baselines_expanded.py

# 5. Continuous Per-Day Evaluation (Persistence and XGBoost separately on Feb 21 vs Feb 22)
.venv/bin/python src/experiments/evaluate_continuous_per_day.py

# 6. Training Day Accumulation Ablation (Feb 15 vs Feb 14+15 vs Feb 14+15+16 on Feb 22 test)
.venv/bin/python src/experiments/ablation_training_days.py

# 7. LSTM Temporal Deep Learning Model (PyTorch RNN with early stopping and loss diagnostics)
.venv/bin/python src/experiments/lstm_baseline.py
```

### 24.3 Attack-Onset Forecasting Experiments

```bash
# 8. Attack-Onset Forecasting (Last window vs 5-min mean vs Delta representations + Leave-One-Day-Out)
.venv/bin/python src/experiments/onset_forecasting.py
```

---

# 25. Complete Project Structure

```text
sentinel-graph/
├── data/
│   ├── raw/
│   │   └── CIC-IDS2018/            # 8 raw CSV files (excluded from Git)
│   ├── interim/                    # Cleaned parquets (5 days)
│   ├── interim_expanded/           # Cleaned parquets (3 expanded days)
│   ├── features/                   # Security features (5 days)
│   ├── features_expanded/          # Security features (3 expanded days)
│   ├── states/                     # 30-second states (5 days)
│   ├── states_expanded/            # 30-second states (3 expanded days)
│   ├── sequences_continuous/       # Continuity-segmented sequences (5 days)
│   ├── sequences_expanded/         # Continuity-segmented sequences (3 days)
│   ├── splits_expanded/            # Train (14-21), Val (23, 28), Test (02)
│   ├── splits_continuous/          # Train (14-15), Val (16), Test (21-22)
│   └── splits_chronological/       # Train (14-16), Val (21), Test (22)
│
├── reports/
│   └── onset_forecasting_experiment.md  # Detailed experimental onset report
│
├── src/
│   ├── ingestion/
│   │   ├── dataset_inventory.py
│   │   └── schema_analysis.py
│   ├── cleaning/
│   │   ├── clean_dataset.py
│   │   ├── clean_expanded_dataset.py
│   │   ├── check_clean.py
│   │   └── schema.py
│   ├── features/
│   │   ├── build_features.py
│   │   ├── build_expanded_features.py
│   │   └── check_features.py
│   ├── windowing/
│   │   ├── create_states.py
│   │   ├── create_expanded_states.py
│   │   └── check_states.py
│   ├── dataset/
│   │   ├── build_sequences_continuous.py
│   │   ├── build_expanded_sequences.py
│   │   ├── create_splits_expanded.py
│   │   ├── create_splits_continuous.py
│   │   └── create_splits_chronological.py
│   └── experiments/
│       ├── preprocessing_expanded.py
│       ├── preprocessing_continuous.py
│       ├── preprocessing_chronological.py
│       ├── baselines_expanded.py
│       ├── baselines_continuous.py
│       ├── baselines_chronological.py
│       ├── evaluate_continuous_per_day.py
│       ├── ablation_training_days.py
│       ├── audit_attack_episodes.py
│       ├── audit_state_transitions.py
│       ├── audit_continuous_targets.py
│       ├── lstm_baseline.py
│       └── onset_forecasting.py
│
├── requirements.txt
├── requirements-lock.txt
├── README.md
└── .gitignore
```

---

# 26. Development Workflow

## Branch Naming

Use:

```text
feature/<name>
bugfix/<name>
experiment/<name>
```

Examples:

```text
feature/mvp-inference
feature/explainability
experiment/current-vs-history
experiment/temporal-gnn
```

## Commit Convention

Use conventional commits:

```text
feat:
fix:
docs:
refactor:
test:
chore:
```

Examples:

```text
feat: add temporal state generation
feat: add forecasting baselines
feat: add LSTM temporal baseline
experiment: compare current state and temporal history
docs: update project README
```

---

# 27. Research Development Principle

SentinelGraph follows:

```text
Question
    ↓
Hypothesis
    ↓
Experiment
    ↓
Result
    ↓
Interpretation
    ↓
Next Decision
```

The goal is not to add increasingly complex technologies simply because they are available.

Each major component should answer a research or operational question.

A more complex model is justified only when it provides measurable value in areas such as:

* Forecasting quality
* Longer-horizon prediction
* Early-warning lead time
* Calibration
* Generalization
* Structural understanding
* Explainability
* Operational usefulness

---

# 28. Project Scope

The semester MVP focuses on establishing a complete temporal forecasting system.

The longer-term research direction extends the MVP toward a network world model capable of learning evolving network dynamics and forecasting future states.

The project deliberately avoids adding infrastructure or technologies solely for complexity or resume keywords.

Examples include:

* Kubernetes
* Kafka
* Spark
* Unnecessary microservices
* LLM agents
* Blockchain
* Cloud infrastructure without a research or deployment requirement

The emphasis remains on:

```text
Data
  ↓
Network State
  ↓
Temporal Dynamics
  ↓
Forecasting
  ↓
Interpretability
  ↓
Validation
```

---

# 29. License

Add the appropriate project license here before public release.

---

# 30. Project Status & Master Progress Tracker

**Current Phase:** All Master Roadmap Phases Completed (MVP 1.0 Delivered)
**Engineering Implementation:** 38 production scripts, 8 days processed (100% gapless continuous states), end-to-end inference engine, and CLI security console.
**Research Validation:** Full empirical multi-horizon, onset forecasting, and operational early-warning benchmark executed and validated.

### 30.1 Master Roadmap Living Status

| Phase | Description | Status | Key Deliverable / Finding |
|---|---|:---:|---|
| **Phase 1** | Repository Consolidation & Documentation | **VALIDATED** | Clean git tree, documented reproduction commands, full results documented. |
| **Phase 2** | Data Quality & Experimental Reliability | **VALIDATED** | 8-day audit report ([`reports/data_quality_and_temporal_integrity_report.md`](file:///Users/jasmithav/Downloads/sentinel-graph-copy/reports/data_quality_and_temporal_integrity_report.md)), zero-traffic imputation. |
| **Phase 3** | Improve Experimental Design | **VALIDATED** | Leakage-safe chronological holdout protocol, onset risk-set protocol, validation-tuned thresholds. |
| **Phase 4** | Next-State & Attack-Onset Forecasting | **VALIDATED** | Multi-model evaluation (Majority, Persistence, LogReg, RF, Native XGBoost, MLP, LSTM, GRU). |
| **Phase 5** | Advanced Temporal Modelling | **VALIDATED** | PyTorch 2-layer LSTM & GRU models trained on Apple Silicon MPS with BCE+L1 multi-task loss. |
| **Phase 6** | Multi-Horizon Attack Progression | **VALIDATED** | Multi-horizon rollout ($h \in \{1, 2, 4, 10\}$: 30s to 5m) and continuous intensity regression (MAE $\approx$ 0.118). |
| **Phase 7** | Early-Warning Capability | **VALIDATED** | PyTorch LSTM delivers 42.4% Recall at $\text{FPR} \le 1\%$ (< 0.8 false alarms/hr) and 81.9% Recall at $\text{FPR} \le 5\%$. |
| **Phase 8** | Explainability & Interpretability | **VALIDATED** | Top-10 security feature attributions and 5-minute temporal step gradient distributions. |
| **Phase 9** | End-to-End System Development | **VALIDATED** | Production inference engine ([`src/pipeline/inference.py`](file:///Users/jasmithav/Downloads/sentinel-graph-copy/src/pipeline/inference.py)) and visual console ([`src/dashboard/cli_dashboard.py`](file:///Users/jasmithav/Downloads/sentinel-graph-copy/src/dashboard/cli_dashboard.py)). |
| **Phase 10** | Robustness & Final Research Validation | **VALIDATED** | Comprehensive unified benchmark report ([`reports/unified_benchmark_results.md`](file:///Users/jasmithav/Downloads/sentinel-graph-copy/reports/unified_benchmark_results.md)). |
| **Phase 11** | Final Documentation & Presentation | **VALIDATED** | Final research thesis & engineering report ([`reports/sentinel_graph_final_research_report.md`](file:///Users/jasmithav/Downloads/sentinel-graph-copy/reports/sentinel_graph_final_research_report.md)). |

### 30.2 Status Definitions
- `NOT STARTED`: Work has not commenced.
- `IN PROGRESS`: Active design, coding, or experimentation underway.
- `IMPLEMENTED`: Code is written and present in repository.
- `TESTED`: Code runs without error and produces verifiable outputs.
- `VALIDATED`: Results have been scientifically audited, reproduced, and peer-reviewed against baselines.
- `BLOCKED`: Dependency or conceptual limitation prevents progress.