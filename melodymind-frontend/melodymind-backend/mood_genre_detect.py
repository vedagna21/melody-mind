# # mood_genre_detect.py
# import sys
# import json
# import librosa
# import torch
# import numpy as np
# from torchvggish import vggish, vggish_input

# # --- Load file path from Node.js ---
# if len(sys.argv) < 2:
#     print(json.dumps({"mood": "Neutral", "genre": "Unknown", "tempo": None}))
#     sys.exit(0)

# file_path = sys.argv[1]

# # --- Load audio ---
# try:
#     y, sr = librosa.load(file_path, sr=16000, mono=True)
# except Exception as e:
#     print(json.dumps({"mood": "Neutral", "genre": "Unknown", "tempo": None}))
#     sys.exit(0)

# # --- Extract VGGish embeddings ---
# try:
#     # Load VGGish pretrained model
#     model = torch.hub.load('harritaylor/torchvggish', 'vggish', pretrained=True)
#     model.eval()
#     # Convert audio to examples
#     examples = vggish_input.waveform_to_examples(y, sr)
#     examples = torch.tensor(examples, dtype=torch.float32)
#     with torch.no_grad():
#         embeddings = model(examples)  # shape: (num_frames, 128)
#     # Average across frames
#     audio_emb = embeddings.mean(dim=0).numpy()
# except Exception as e:
#     audio_emb = np.random.rand(128)

# # --- Mock Mood Prediction (replace with ML model if available) ---
# moods = ["Happy", "Sad", "Neutral", "Energetic", "Calm"]
# genres = ["Pop", "Rock", "Hip-Hop", "Classical", "Jazz", "Electronic", "Unknown"]

# # Simple heuristic: sum embedding values to pick a mood/genre
# mood_idx = int(audio_emb.sum() * 100) % len(moods)
# genre_idx = int(audio_emb.sum() * 50) % len(genres)

# # --- Tempo Detection ---
# try:
#     tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
# except:
#     tempo = None

# # --- Return JSON ---
# result = {
#     "mood": moods[mood_idx],
#     "genre": genres[genre_idx],
#     "tempo": round(float(tempo), 2) if tempo else None
# }

# print(json.dumps(result))
import sys
import json
import librosa
import numpy as np
import warnings

warnings.filterwarnings("ignore")

def analyze_song(file_path):
    try:
        # Load audio
        y, sr = librosa.load(file_path, duration=60)  # analyze first 60s for speed
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

        # Extract simple audio features
        energy = np.mean(librosa.feature.rms(y=y))
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
        zero_crossings = np.mean(librosa.feature.zero_crossing_rate(y))

        # Basic mood classification logic
        if tempo > 130 and energy > 0.03:
            mood = "Energetic"
            genre = "Pop"
        elif tempo > 110:
            mood = "Happy"
            genre = "Dance"
        elif tempo < 80 and spectral_centroid < 2000:
            mood = "Sad"
            genre = "Classical"
        elif zero_crossings < 0.05:
            mood = "Calm"
            genre = "Jazz"
        else:
            mood = "Neutral"
            genre = "Indie"

        result = {
            "mood": mood,
            "genre": genre,
            "tempo": round(float(tempo), 2)
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"mood": "Neutral", "genre": "Unknown", "tempo": 0}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
    else:
        analyze_song(sys.argv[1])
