import os
import sys
import re
import json
import datetime
import cv2
from PIL import Image, ImageOps

BASE_DIR = r"m:\bday"
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
THUMBS_DIR = os.path.join(ASSETS_DIR, "thumbs")
os.makedirs(THUMBS_DIR, exist_ok=True)

# Romantic caption pools for variation
BEFORE_CAPTIONS = [
    ("When you were just a notification, but already my favorite one.", "The Spark"),
    ("Late night chats where hours felt like minutes.", "Late Nights"),
    ("That nervous flutter in my stomach whenever you replied.", "Butterflies"),
    ("Staring at my screen smiling like a total fool.", "Subtle Smiles"),
    ("We were 'just talking'... but my heart was already leaning into you.", "Secret Feelings"),
    ("A quiet snapshot from the days the magic was just beginning.", "First Chapters"),
    ("Back when I was finding every silly excuse just to talk to you.", "Stolen Hours"),
    ("How did a random conversation turn into my whole world?", "Sweet Memories"),
    ("The days before us, when the universe was quietly plotting.", "Unfolding"),
    ("Every little message from you made ordinary days feel extraordinary.", "Sunlit Days"),
    ("That subtle spark before the fire started.", "The Beginning"),
    ("Looking back now, I think I was falling for you even then.", "Pure Magic"),
    ("The sweet innocence of two people who didn't know what was coming.", "First Glances"),
    ("Just you, being your effortless, adorable self.", "Sunflower Soul"),
    ("A memory etched into the quiet start of our story.", "Timeless"),
    ("The way your laugh could turn my entire day around.", "Your Laugh"),
    ("Counting down the seconds until we'd chat again.", "Anticipation"),
    ("Before the kisses, there was this sweet, beautiful curiosity.", "Sweet Beginning")
]

AFTER_CAPTIONS = [
    ("That night everything changed and the rest of the world vanished.", "The Shift"),
    ("Our first kiss... when words became completely unnecessary.", "That First Kiss"),
    ("Holding you close, wishing time would freeze right here.", "In Your Arms"),
    ("The electric silence where we both knew, without saying a word.", "Unspoken Truth"),
    ("My favorite place in the entire universe is next to you.", "Safe Haven"),
    ("We haven't said it out loud yet, but my heart screams it every day.", "Heartstrings"),
    ("Late nights, soft breathing, and the sweetest warmth in my chest.", "Midnight Magic"),
    ("The way your eyes look right before you lean in.", "Stolen Kisses"),
    ("You became my favorite thought from sunrise to midnight.", "My Sunshine"),
    ("Every touch felt like a promise we hadn't put into words.", "Silent Vows"),
    ("Just you and me, locked in our own secret orbit.", "Our Secret World"),
    ("Look at you... how could anyone not fall completely in love?", "Goddess"),
    ("The intimacy of two souls that finally found each other.", "Deep Connection"),
    ("Soft smiles, messy hair, and purest happiness.", "Cozy Moments"),
    ("You bring the sun with you wherever you go.", "Sunflower Bloom"),
    ("The tenderness of holding your hand in the quiet dark.", "Gentle Warmth"),
    ("When you're with me, every single heavy thought disappears.", "My Peace"),
    ("Every second since that shift has been pure poetry.", "Our Symphony"),
    ("You are my favorite habit, my best choice, my cutie.", "Forever Mood"),
    ("Unspoken words, undeniable gravity.", "Pure Magnetism")
]

def parse_date(filename, filepath):
    m = re.search(r'(?:IMG|VID)[-_](\d{4})(\d{2})(\d{2})', filename)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    m2 = re.search(r'Screenshot_(\d{4})-(\d{2})-(\d{2})', filename)
    if m2:
        return f"{m2.group(1)}-{m2.group(2)}-{m2.group(3)}"
    m3 = re.search(r'Picsart_(\d{2})-(\d{2})-(\d{2})', filename)
    if m3:
        yy = '20' + m3.group(1)
        return f"{yy}-{m3.group(2)}-{m3.group(3)}"
    m4 = re.search(r'IMG_(\d{4})(\d{2})(\d{2})', filename)
    if m4:
        return f"{m4.group(1)}-{m4.group(2)}-{m4.group(3)}"
    ts = os.path.getmtime(filepath)
    return datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')

def format_date_pretty(date_str):
    try:
        dt = datetime.datetime.strptime(date_str, '%Y-%m-%d')
        return dt.strftime('%b %d, %Y')
    except Exception:
        return date_str

def process_image(src_path, thumb_path, max_dim=640):
    try:
        with Image.open(src_path) as img:
            img = ImageOps.exif_transpose(img)
            w, h = img.size
            ratio = round(w / h, 3) if h else 1.0
            
            # Create thumbnail
            img_thumb = img.copy()
            if img_thumb.mode in ("RGBA", "P"):
                img_thumb = img_thumb.convert("RGB")
            img_thumb.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            img_thumb.save(thumb_path, "WEBP", quality=82, method=4)
            return w, h, ratio, True
    except Exception as e:
        print(f"Error processing image {src_path}: {e}")
        return 0, 0, 1.0, False

def process_video(src_path, thumb_path, max_dim=640):
    try:
        cap = cv2.VideoCapture(src_path)
        if not cap.isOpened():
            print(f"Cannot open video: {src_path}")
            return 0, 0, 1.0, 0, "0:00", False
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        duration_sec = total_frames / fps if fps > 0 else 0
        minutes = int(duration_sec // 60)
        seconds = int(duration_sec % 60)
        dur_str = f"{minutes}:{seconds:02d}"
        
        target_frame = min(int(fps * 0.5), max(0, total_frames - 1))
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = cap.read()
        cap.release()
        
        if ret and frame is not None:
            # OpenCV BGR -> RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb_frame)
            w, h = pil_img.size
            ratio = round(w / h, 3) if h else 1.0
            pil_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            pil_img.save(thumb_path, "WEBP", quality=82, method=4)
            return w, h, ratio, duration_sec, dur_str, True
        else:
            return 0, 0, 1.0, duration_sec, dur_str, False
    except Exception as e:
        print(f"Error processing video {src_path}: {e}")
        return 0, 0, 1.0, 0, "0:00", False

def run():
    folders = [
        ("before", r"m:\bday\memories before", "Chapter 1: The Spark", BEFORE_CAPTIONS),
        ("after", r"m:\bday\after smtg happened bw us", "Chapter 2: The Shift & Kisses", AFTER_CAPTIONS)
    ]
    
    all_items = []
    global_id = 0
    
    for ch_key, folder_path, ch_title, caption_pool in folders:
        files = sorted(os.listdir(folder_path))
        print(f"Processing {folder_path} ({len(files)} files)...")
        
        # Collect raw items with dates for sorting
        folder_items = []
        for f in files:
            p = os.path.join(folder_path, f)
            if not os.path.isfile(p):
                continue
            ext = os.path.splitext(f)[1].lower()
            if ext in [".jpg", ".jpeg", ".png", ".webp"]:
                media_type = "image"
            elif ext in [".mp4", ".mov"]:
                media_type = "video"
            else:
                continue
            
            raw_date = parse_date(f, p)
            folder_items.append((raw_date, f, p, media_type))
            
        # Sort chronologically within the chapter
        folder_items.sort(key=lambda x: (x[0], x[1]))
        
        for idx, (raw_date, filename, full_path, media_type) in enumerate(folder_items):
            global_id += 1
            item_id = f"mem_{global_id:03d}"
            thumb_filename = f"thumb_{ch_key}_{idx:03d}.webp"
            thumb_rel_path = f"assets/thumbs/{thumb_filename}"
            thumb_full_path = os.path.join(THUMBS_DIR, thumb_filename)
            
            # URL friendly relative src
            folder_name = os.path.basename(folder_path)
            # URL encoded relative path
            rel_src = f"{folder_name}/{filename}"
            
            caption_item = caption_pool[idx % len(caption_pool)]
            caption_text, tag = caption_item
            
            is_featured = (idx % 6 == 0) or (idx in [0, 1, 2, len(folder_items)-1])
            
            if media_type == "image":
                w, h, ratio, ok = process_image(full_path, thumb_full_path)
                dur_sec, dur_str = 0, ""
            else:
                w, h, ratio, dur_sec, dur_str, ok = process_video(full_path, thumb_full_path)
                
            pretty_date = format_date_pretty(raw_date)
            
            # Create title
            if media_type == "video":
                title = f"Moment {idx + 1} 📹"
            else:
                title = f"Memory {idx + 1} 🌻"
                
            all_items.append({
                "id": item_id,
                "title": title,
                "chapter": ch_key,
                "chapterTitle": ch_title,
                "type": media_type,
                "src": rel_src,
                "thumb": thumb_rel_path,
                "filename": filename,
                "rawDate": raw_date,
                "date": pretty_date,
                "width": w,
                "height": h,
                "aspectRatio": ratio,
                "isPortrait": (h > w),
                "durationSec": round(dur_sec, 1),
                "duration": dur_str,
                "tag": tag,
                "caption": caption_text,
                "featured": is_featured
            })
            
            if global_id % 15 == 0 or global_id == len(folder_items):
                print(f"Processed {global_id} items...")

    print(f"Finished processing {len(all_items)} total items!")
    
    # Save to data.json
    json_path = os.path.join(ASSETS_DIR, "data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_items, f, indent=2, ensure_ascii=False)
        
    # Save to data.js for zero-cors direct file:/// support
    js_path = os.path.join(ASSETS_DIR, "data.js")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("window.MEMORIES_DATA = ")
        json.dump(all_items, f, indent=2, ensure_ascii=False)
        f.write(";\n")
        
    print(f"Saved metadata to {json_path} and {js_path}!")

if __name__ == "__main__":
    run()
