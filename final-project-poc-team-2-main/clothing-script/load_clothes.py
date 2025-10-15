#!/usr/bin/env python3
"""
Load clothing items (including image_url) from a CSV into the clothing_item table.
CSV headers must be:
name,description,color,pattern,material,estimated_pricing,gender,events,type_of_clothing,image_url
"""

import csv
import sys
import psycopg2
from psycopg2.extras import execute_values

# tip: keep creds in env vars or .env instead of hard-coding
CONN_STR = (
    "dbname=clothing "
    "user=postgres "
    "password=postgres "
    "host=localhost "
    "port=5432"
)

def load_csv(path: str) -> None:
    with open(path, newline="", encoding="utf-8") as f:
        rows = [
            (
                r["name"],
                r["description"],
                r["color"],
                r["pattern"],
                r["material"],
                r["estimated_pricing"],
                r["gender"],
                r["events"],
                r["type_of_clothing"],
                r["image_name"],            # NEW FIELD
            )
            for r in csv.DictReader(f)
        ]

    if not rows:
        print("No rows found – nothing inserted.")
        return

    sql = """
        INSERT INTO clothing_item
        (name, description, color, pattern, material,
         estimated_pricing, gender, events, type_of_clothing, image_url)
        VALUES %s
    """

    with psycopg2.connect(CONN_STR) as conn:
        with conn.cursor() as cur:
            execute_values(cur, sql, rows)
        conn.commit()

    print(f"✅ Inserted {len(rows)} rows.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: load_clothes.py <csv_path>")
    load_csv(sys.argv[1])

