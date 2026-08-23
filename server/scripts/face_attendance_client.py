"""
=============================================================================
DCS-HIMS Face Recognition Attendance Integration Script
=============================================================================
Use this script to push live attendance logs from your Python OpenCV / DeepFace /
FaceNet / dlib facial recognition camera system directly into DCS-HIMS.

Setup:
    pip install requests

Configuration:
    Set DCS_SERVER_URL and API_KEY to match your environment.
"""

import datetime
import requests

# DCS-HIMS Server Endpoint
DCS_SERVER_URL = "http://localhost:5000/api/attendance/face-punch"
# If hosted on a server / cloud domain:
# DCS_SERVER_URL = "https://your-api-domain.com/api/attendance/face-punch"

# API Key (Defined in server/.env: BIOMETRIC_API_KEY)
BIOMETRIC_API_KEY = "dcs_face_recognition_secure_key_2026"

DEVICE_ID = "OFFICE_ENTRANCE_CAM_01"


def send_face_punch(employee_code, confidence=0.98, punch_type="AUTO", image_url=None):
    """
    Sends a face detection punch to the DCS-HIMS attendance engine.

    Args:
        employee_code (str): Employee identifier (e.g. "DCS-EMP-001" or email "sameer@example.com")
        confidence (float): Face match confidence score (0.0 to 1.0)
        punch_type (str): "AUTO" (auto-detects check-in/out), "CHECK_IN", or "CHECK_OUT"
        image_url (str, optional): Optional URL of captured face snapshot

    Returns:
        dict: Server response JSON
    """
    headers = {
        "Content-Type": "application/json",
        "x-api-key": BIOMETRIC_API_KEY,
    }

    payload = {
        "employee_code": employee_code,
        "punch_time": datetime.datetime.now().isoformat(),
        "device_id": DEVICE_ID,
        "confidence": confidence,
        "punch_type": punch_type,
        "remarks": f"Verified via Face AI ({DEVICE_ID})",
    }

    if image_url:
        payload["image_url"] = image_url

    try:
        response = requests.post(DCS_SERVER_URL, json=payload, headers=headers, timeout=5)
        result = response.json()

        if response.status_code == 200:
            print(f"[SUCCESS] Attendance logged: {result.get('message')}")
            return result
        else:
            print(f"[ERROR {response.status_code}] Failed: {result.get('message')}")
            return result
    except Exception as e:
        print(f"[NETWORK ERROR] Could not connect to DCS-HIMS server: {e}")
        return None


def send_batch_punches(punch_list):
    """
    Sends a batch of offline/queued face punches to the DCS-HIMS server.
    """
    batch_url = "http://localhost:5000/api/attendance/biometric-batch"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": BIOMETRIC_API_KEY,
    }

    payload = {
        "device_id": DEVICE_ID,
        "records": punch_list,
    }

    try:
        response = requests.post(batch_url, json=payload, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        print(f"[BATCH ERROR] Failed to send batch: {e}")
        return None


# -----------------------------------------------------------------------------
# QUICK TEST EXAMPLE:
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    print("--- Testing DCS-HIMS Face Recognition Attendance Integration ---")
    
    # Example 1: Check in DCS-EMP-001 (Sameer)
    send_face_punch(employee_code="DCS-EMP-001", confidence=0.99, punch_type="AUTO")
    
    # Example 2: Check in DCS-EMP-002 (Om)
    send_face_punch(employee_code="DCS-EMP-002", confidence=0.97, punch_type="AUTO")
