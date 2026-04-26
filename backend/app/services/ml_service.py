import os
import joblib
import numpy as np
import pandas as pd
import shap
from pathlib import Path
from fastapi import HTTPException

_artifacts = None


def load_artifacts():
    global _artifacts
    path = Path(os.getenv("MODEL_PATH", "../data/model_artifacts_v2.pkl"))
    _artifacts = joblib.load(path)


def _encode_input(flight_input) -> pd.DataFrame:
    arts = _artifacts
    data = {}

    for col in arts["categorical_cols"]:
        if col == "flight":
            continue
        attr = "flight_class" if col == "class" else col
        val = getattr(flight_input, attr)
        le = arts["encoders"][col]
        try:
            data[col] = int(le.transform([val])[0])
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail=f"Unknown value '{val}' for field '{col}'. Valid values: {list(le.classes_)}",
            )

    num_vals = np.array([[flight_input.duration, flight_input.days_left]], dtype=float)
    scaled = arts["scaler"].transform(num_vals)[0]
    data["duration"] = float(scaled[0])
    data["days_left"] = float(scaled[1])

    feature_cols = [c for c in arts["feature_cols"] if c != "flight"]
    return pd.DataFrame([data])[feature_cols]


def predict(flight_input) -> float:
    df = _encode_input(flight_input)
    return float(_artifacts["model"].predict(df)[0])


def explain(flight_input) -> tuple[dict[str, float], float]:
    df = _encode_input(flight_input)
    model = _artifacts["model"]
    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(df)
    feature_cols = [c for c in _artifacts["feature_cols"] if c != "flight"]
    importance = {col: float(shap_vals[0][i]) for i, col in enumerate(feature_cols)}
    base_value = float(explainer.expected_value)
    return importance, base_value
