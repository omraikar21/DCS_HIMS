# Face Detection & Biometric Attendance Integration Guide

DCS-HIMS provides built-in REST API endpoints to connect any **Face Recognition Camera**, **Biometric Machine**, or **Python OpenCV / DeepFace Script**.

---

## 1. Authentication
All face recognition and biometric requests must include the `x-api-key` header:

```http
x-api-key: dcs_face_recognition_secure_key_2026
```
*(You can customize this key in `server/.env` under `BIOMETRIC_API_KEY`)*

---

## 2. API Endpoints

### A. Single Face Detection Punch (Live / Real-Time)
- **URL**: `POST /api/attendance/face-punch` (or `/api/attendance/biometric-punch`)
- **Headers**:
  ```http
  Content-Type: application/json
  x-api-key: dcs_face_recognition_secure_key_2026
  ```
- **Request Body (JSON)**:
  ```json
  {
    "employee_code": "DCS-EMP-001",
    "punch_time": "2026-08-23T09:15:00.000Z",
    "device_id": "OFFICE_ENTRANCE_CAM_01",
    "confidence": 0.985,
    "punch_type": "AUTO",
    "remarks": "Recognized at Main Gate"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Face attendance logged for Sameer (DCS-EMP-001). Action: CHECK_IN_RECORDED",
    "data": {
      "action": "CHECK_IN_RECORDED",
      "attendance": { ... },
      "employee": {
        "id": 1,
        "code": "DCS-EMP-001",
        "name": "Sameer",
        "email": "sameer@example.com"
      }
    }
  }
  ```

---

### B. Batch Punch Sync (For Offline / Bulk Records)
- **URL**: `POST /api/attendance/biometric-batch`
- **Request Body (JSON)**:
  ```json
  {
    "device_id": "OFFICE_CAM_01",
    "records": [
      { "employee_code": "DCS-EMP-001", "punch_time": "2026-08-23T09:12:00" },
      { "employee_code": "DCS-EMP-002", "punch_time": "2026-08-23T09:14:30" }
    ]
  }
  ```

---

## 3. Python Integration Example
In your Python face recognition script (e.g. OpenCV / DeepFace / FaceNet):

```python
import requests

def record_attendance(employee_code, confidence=0.98):
    url = "http://localhost:5000/api/attendance/face-punch"
    headers = {"x-api-key": "dcs_face_recognition_secure_key_2026"}
    payload = {
        "employee_code": employee_code,
        "confidence": confidence,
        "device_id": "ENTRANCE_CAM"
    }
    res = requests.post(url, json=payload, headers=headers)
    print(res.json())
```
See `face_attendance_client.py` for a full runnable script!
