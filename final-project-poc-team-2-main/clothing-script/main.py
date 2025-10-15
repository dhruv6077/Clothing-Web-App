"""
Filters to ask for
Color, Material, Pattern/Texture, Style, Estimated Pricing, Gender, Events, Type of clothing (Pants, Shirt, Etc.)
"""

import os
import base64
import csv
import json
import time
import logging
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List

import httpx
from openai import OpenAI
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv

from utils import system_prompt_4

# ---------------------------------------------------------------------------
# Setup & Logging
# ---------------------------------------------------------------------------

load_dotenv()  # Load environment variables from .env if present

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)

# ---------------------------------------------------------------------------
# Config constants
# ---------------------------------------------------------------------------

REQUEST_INTERVAL_SECONDS = 11  # ← throttle: one OpenAI call per 10 seconds
API_BACKOFF_SECONDS = 5        # initial back‑off when 429 encountered
MAX_RETRIES = 5

# ---------------------------------------------------------------------------
# Enums & Data Models
# ---------------------------------------------------------------------------

class Gender(str, Enum):
    male = "male"
    female = "female"
    unisex = "unisex"

class ClothingAnalysis(BaseModel):
    style: str
    color: str
    pattern: str
    material: str
    estimated_pricing: str
    gender: Gender
    events: str  # Comma‑separated list when multiple
    type_of_clothing: str
    name: str
    description: str


    # Accept "Male", "MALE", etc.
    @field_validator("gender", mode="before")
    @classmethod
    def normalize_gender(cls, v: str):
        v = str(v).lower()
        if v not in Gender._value2member_map_:
            raise ValueError("gender must be male, female, or unisex")
        return v

    @classmethod
    def _flatten(cls, value: Any) -> str:
        """Return *value* as a comma‑separated string if it's a list, else str(value)."""
        if isinstance(value, list):
            return ", ".join(map(str, value))
        return str(value)

    @classmethod
    def fill_missing(cls, raw: Dict[str, Any]) -> "ClothingAnalysis":
        """Return a valid instance even if *raw* has missing keys or wrong types."""
        defaults: Dict[str, Any] = {
            "style": "unknown",
            "color": raw.get("color", "unknown"),
            "pattern": "unknown",
            "material": "unknown",
            "estimated_pricing": "unknown",
            "gender": "unisex",
            "events": "unknown",
            "type_of_clothing": "unknown",
            "name": "unknown",
            "description": "unknown",
        }
        for k, v in raw.items():
            key = k.lower()
            if key in defaults and v is not None:
                defaults[key] = cls._flatten(v)
        return cls.model_validate(defaults)


# ---------------------------------------------------------------------------
# OpenAI helpers
# ---------------------------------------------------------------------------


def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in environment or .env file")
    return OpenAI(api_key=api_key)


def analyze_image(image_file, image_name: str, client: OpenAI) -> ClothingAnalysis:
    b64_image = base64.b64encode(image_file.read()).decode("utf-8")

    payload_msgs = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        system_prompt_4
                        + "\n\nRespond ONLY with JSON matching this schema: "
                        "{style, color, pattern, material, estimated_pricing, gender, events, type_of_clothing, name, description}."
                    ),
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{b64_image}"},
                },
            ],
        }
    ]

    backoff = API_BACKOFF_SECONDS
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=payload_msgs,
                response_format={"type": "json_object"},
            )
            assistant_msg = response.choices[0].message.content
            analysis_dict = json.loads(assistant_msg)
            return ClothingAnalysis.fill_missing(analysis_dict)
        except json.JSONDecodeError:
            logging.warning(f"{image_name}: model returned non‑JSON; using defaults.")
            return ClothingAnalysis.fill_missing({})
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429 and attempt < MAX_RETRIES:
                logging.warning(
                    f"[RATE LIMIT] {image_name}: waiting {backoff}s before retry {attempt}/{MAX_RETRIES}"
                )
                time.sleep(backoff)
                backoff *= 2
                continue
            raise


# ---------------------------------------------------------------------------
# CSV helpers
# ---------------------------------------------------------------------------

CSV_PATH = "./migration-files/data-2.csv"
FIELDNAMES = ["image_name", *ClothingAnalysis.model_fields.keys()]


def row_from_analysis(image_name: str, analysis: ClothingAnalysis) -> Dict[str, str]:
    data = analysis.model_dump()
    data["image_name"] = image_name
    return data


# ---------------------------------------------------------------------------
# Main processing loop
# ---------------------------------------------------------------------------

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def collect_files(images_root: str) -> List[Path]:
    """
    Recursively collect all files under images_root whose
    suffix matches one of the allowed image extensions.
    """
    return [
        p for p in Path(images_root).rglob("*.*")
        if p.is_file() and p.suffix.lower() in ALLOWED_EXTENSIONS
    ]


def maybe_wait(next_allowed: float):
    """Sleep until *next_allowed* time (UNIX seconds) if we haven’t reached it yet."""
    now = time.time()
    if now < next_allowed:
        wait = next_allowed - now
        logging.info(f"Throttling → sleeping {wait:.1f}s to respect 1‑call/min limit…")
        time.sleep(wait)


def main(images_root: str = "images/image_run_5", csv_path: str = CSV_PATH):
    files = collect_files(images_root)
    total = len(files)
    logging.info(f"Found {total} files in '{images_root}'. Writing to '{csv_path}'.")

    processed = 0
    next_allowed_time = time.time()  # earliest moment we can hit the API
    client = get_openai_client()

    file_exists = os.path.isfile(csv_path)
    with open(csv_path, "a", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=FIELDNAMES)
        if not file_exists:
            writer.writeheader()

        for idx, img_path in enumerate(files, 1):
            logging.info(f"[{idx}/{total}] Processing {img_path.name} …")
            maybe_wait(next_allowed_time)

            try:
                with img_path.open("rb") as image_file:
                    analysis = analyze_image(image_file, img_path.name, client)
                writer.writerow(row_from_analysis(img_path.name, analysis))
                processed += 1
                logging.info(f"→ Wrote analysis for {img_path.name}")
            except Exception as e:
                logging.error(f"[ERROR] {img_path.name}: {e}")
            finally:
                # set the next allowed time regardless of success, to maintain the minute gap
                next_allowed_time = time.time() + REQUEST_INTERVAL_SECONDS

    logging.info(f"Done: processed {processed}/{total} images. CSV saved to '{csv_path}'.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.warning("Interrupted by user — exiting early.")
