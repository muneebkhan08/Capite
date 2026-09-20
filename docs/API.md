# Capite REST API Documentation

Base URL: `http://localhost:5000`

Capite provides a lightweight, asynchronous REST API for video transcription, animated subtitle generation, video re-rendering, subtitle export, and media streaming.

---

## Endpoints

### 1. Health Check

```http
GET /api/health
```

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

### 2. Process Video

Uploads a video and queues a transcription & caption burn-in job.

```http
POST /api/process
Content-Type: multipart/form-data
```

#### Request Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | Yes | Video file (`.mp4`, `.mov`, `.webm`) up to `MAX_FILE_SIZE_MB` |
| `captionStyle` | String | No | Style preset ID (e.g. `hormozi`, `mrbeast`, `crimson-pop`, etc. Default: `hormozi`) |
| `captionPosition` | Integer | No | Position percentage from bottom (5-50, default: `20`) |
| `customFont` | String | No | Custom font family override |
| `fontWeight` | String | No | Weight: `default`, `light`, `regular`, `medium`, `semibold`, `bold`, `extrabold` |
| `weightTransition` | String | No | Transition style: `none`, `light_to_bold`, `bold_to_light` |
| `primaryColor` | String | No | Hex color or `none` |
| `highlightColor` | String | No | Hex color or `none` |
| `outlineColor` | String | No | Hex color or `none` |
| `backgroundColor` | String | No | Hex color or `none` |
| `fontStyle` | String | No | Font style: `default`, `normal`, `italic` |
| `textCasing` | String | No | Casing: `default`, `uppercase`, `lowercase`, `titlecase`, `original` |

#### Response (`200 OK`)
```json
{
  "jobId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "pending"
}
```

#### Errors
- `400 Bad Request` — Missing file, invalid file extension, unsupported style, or invalid position.
- `413 Payload Too Large` — File exceeds maximum allowed size.
- `429 Too Many Requests` — Concurrent job limit reached.

---

### 3. Job Status

Polls the current status, progress percentage, active phase, and transcription metadata of a job.

```http
GET /api/status/{jobId}
```

#### Response (`200 OK`)
```json
{
  "jobId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "processing",
  "progress": 75,
  "currentPhase": "burning",
  "language": "en",
  "durationSeconds": 42.5,
  "captionStyle": "hormozi",
  "captionPosition": 20,
  "transcript": {
    "language": "en",
    "segments": [ ... ]
  },
  "errorMessage": null
}
```

#### Status Values
- `pending`: Waiting in queue
- `processing`: Active in pipeline
- `completed`: Processing finished and output video is ready
- `failed`: An error occurred (details in `errorMessage`)

#### Phase Values
- `transcribing`: Whisper is transcribing speech & word timestamps
- `generating_subtitles`: Generating ASS script and animations
- `burning`: FFmpeg is burning captions into the video
- `finalizing`: Verifying output file integrity

---

### 4. Re-render Subtitles

Re-renders a video with an edited transcript, changed caption style, altered font settings, custom colors, or position without re-running transcription.

```http
POST /api/rerender/{jobId}
Content-Type: application/json
```

#### Request Body
```json
{
  "transcript": {
    "language": "en",
    "segments": [
      {
        "id": 0,
        "start": 0.0,
        "end": 2.4,
        "text": "Hello and welcome to Capite!",
        "words": [
          { "word": "Hello", "start": 0.0, "end": 0.5, "score": 0.98 },
          { "word": "and", "start": 0.5, "end": 0.8, "score": 0.99 },
          { "word": "welcome", "start": 0.8, "end": 1.4, "score": 0.97 },
          { "word": "to", "start": 1.4, "end": 1.7, "score": 0.95 },
          { "word": "Capite!", "start": 1.7, "end": 2.4, "score": 0.99 }
        ]
      }
    ]
  },
  "captionStyle": "mrbeast",
  "captionPosition": 25,
  "customFont": "Montserrat",
  "fontWeight": "bold",
  "primaryColor": "#FFFFFF",
  "highlightColor": "#FFD700"
}
```

#### Query Parameters
- `sync=true` (optional): Synchronous re-render (waits until completion before returning). Default is background async.

#### Response (`200 OK`)
```json
{
  "jobId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "processing"
}
```

---

### 5. Export Subtitles

Exports generated or edited subtitles in various industry formats.

```http
GET /api/export/{jobId}?format=srt
```

#### Supported Formats (`format` parameter)
- `srt` — SubRip subtitle file (`.srt`)
- `vtt` — WebVTT subtitle file (`.vtt`)
- `txt` — Plain text transcript (`.txt`)
- `ass` — Advanced SubStation Alpha styled animation file (`.ass`)

#### Response (`200 OK`)
Binary attachment stream with proper MIME type and `Content-Disposition`.

---

### 6. Video Stream

Streams either the captioned result video or original uploaded video with HTTP Range request support for seeking.

```http
GET /api/video/{jobId}?type=captioned
```

#### Query Parameters
- `type`: `captioned` (default) or `original`

#### Response (`200 OK` / `206 Partial Content`)
Binary video stream (`video/mp4`).

---

### 7. Download Captioned Video

Downloads the completed captioned video file.

```http
GET /api/download/{jobId}
```

#### Response (`200 OK`)
Attachment video stream (`video/mp4`) with `Content-Disposition: attachment; filename="captioned-<filename>.mp4"`.

#### Errors
- `404 Not Found` — Job not found or output file missing.
- `409 Conflict` — Job is still processing or has failed.

---

### 8. Delete Job

Deletes a job and cleans up all associated scratch files, uploads, and rendered videos.

```http
DELETE /api/jobs/{jobId}
```

#### Response (`200 OK`)
```json
{
  "deleted": true
}
```
