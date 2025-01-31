import librosa
import joblib
import numpy as np

# Function to extract features from audio files
def extract_features(file_path):
    try:
        # Try loading the file with librosa and SoundFile first
        y, sr = librosa.load(file_path, sr=None)  # Remove duration and offset for debugging
        
        # Check if the audio signal is too short or empty
        if len(y) < 2048:
            raise ValueError(f"Audio signal too short: {file_path}")
        
        # Extract MFCC features
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        
        # Take the mean of the MFCCs (a 1D feature vector)
        mfcc_scaled = np.mean(mfcc.T, axis=0)
        
        return mfcc_scaled
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def run_model(new_audio_file):
    # Load the trained model
    model = joblib.load("rf_model.pkl")

    # Extract features from the new audio file
    new_feature = extract_features(new_audio_file)
    # Check if feature extraction was successful
    if new_feature is not None:
        # Reshape the feature to match the input shape of the model
        new_feature = new_feature.reshape(1, -1)
        # Predict the confidence of the new audio file
        confidence = model.predict_proba(new_feature)[0, 1]
        print(f"Confidence of the new audio file: {confidence:.2f}")
    else:
        print(f"Failed to extract features from {new_audio_file}")
    return confidence*1.2*100