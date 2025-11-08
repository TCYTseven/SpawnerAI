import numpy as np
import tensorflow as tf
import random
import matplotlib.pyplot as plt
import os

from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Flatten, Dense, Dropout

STYLES = ["offense", "tank", "support", "scout", "hybrid"]

models = []
for i, style_name in enumerate(STYLES):
    model_path = f"models/{style_name}.h5"
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}.")
    else:
        models.append(load_model(model_path))

def preprocess_data_for_style(match_history, style_index):
    stat_pools = [[0, 0, 0, 0, 0] for _ in range(10)]
    for match in match_history:
        hero_stat = match[0][style_index]
        bin_index = min(int(hero_stat / 10.01), 9)
        stat_pools[bin_index][0] += match[1]
        stat_pools[bin_index][1] += match[2]
        stat_pools[bin_index][2] += match[3]
        stat_pools[bin_index][3] += match[4]
        stat_pools[bin_index][4] += 1

    processed_data = np.zeros((10, 4))
    for i, pool in enumerate(stat_pools):
        if pool[4] > 0:
            processed_data[i] = [p / pool[4] for p in pool[:4]]
    return processed_data

def predict(history):
    predicted_affinities = {}

    for i, style_name in enumerate(STYLES):
        input_data = preprocess_data_for_style(history, i)
        input_data_reshaped = np.expand_dims(input_data, axis=0)
        predicted_affinity = models[i].predict(input_data_reshaped, verbose=0)[0][0]
        predicted_affinities[style_name] = np.clip(predicted_affinity, 0, 100)

    for style_name, affinity in predicted_affinities.items():
        print(f"{style_name:<10}: {affinity:.2f}")

    return predicted_affinities
