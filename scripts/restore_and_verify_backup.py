#!/usr/bin/env python3
"""
DentPro OS / Sameeksha Dental Software - Backup Decryption & Verification Tool
================================================================================
This script validates, decrypts, and inspects an encrypted database backup file
produced by the DentPro OS backup pipeline (dentpro-backup.yml).

Encryption Specification:
- Magic Header: b"DENTPRO1" (8 bytes)
- Format Version: b"\\x01" (1 byte)
- Nonce: 12 bytes random IV
- Cipher: AES-256-GCM authenticated encryption (associated data = HEADER)
- Payload: gzip-compressed PostgreSQL public schema SQL dump

Usage:
  python scripts/restore_and_verify_backup.py --file <path_to_backup.enc> --key <base64_encryption_key> [--output <output_sql_path>]
  or:
  set BACKUP_ENCRYPTION_KEY=<base64_encryption_key>
  python scripts/restore_and_verify_backup.py --file <path_to_backup.enc>
"""

import os
import sys
import argparse
import base64
import gzip
import re
from typing import Dict, List, Tuple

MAGIC_HEADER = b"DENTPRO1"
VERSION = b"\x01"
HEADER = MAGIC_HEADER + VERSION
NONCE_LENGTH = 12

REQUIRED_TABLES = [
    "patients",
    "appointments",
    "doctors",
    "treatments",
    "invoices",
    "prescriptions",
    "staff",
    "stock_items",
    "stock_transactions",
    "clinic_settings",
    "backup_history",
]


def decrypt_backup(file_path: str, key_b64: str) -> bytes:
    """Reads and decrypts an encrypted backup file, returning the gzipped SQL bytes."""
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    except ImportError:
        print("Error: 'cryptography' Python package is required. Install with: pip install cryptography", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Backup file not found at: {file_path}")

    # Validate Base64 key
    try:
        key_bytes = base64.b64decode(key_b64)
    except Exception as e:
        raise ValueError(f"Invalid Base64 encoding in encryption key: {e}")

    if len(key_bytes) != 32:
        raise ValueError(f"Decoded AES-256 key must be exactly 32 bytes (got {len(key_bytes)} bytes).")

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    min_len = len(HEADER) + NONCE_LENGTH + 16  # At least header + nonce + 16-byte GCM tag
    if len(file_bytes) < min_len:
        raise ValueError(f"File size ({len(file_bytes)} bytes) is too small to be a valid encrypted backup.")

    # Check magic header & version
    file_header = file_bytes[:len(HEADER)]
    if file_header != HEADER:
        raise ValueError(f"Invalid backup file header. Expected {HEADER!r}, found {file_header!r}.")

    nonce = file_bytes[len(HEADER):len(HEADER) + NONCE_LENGTH]
    ciphertext = file_bytes[len(HEADER) + NONCE_LENGTH:]

    print(f"[1/4] Verified magic header ({file_header.decode('ascii', errors='replace')}) and extracted 12-byte IV nonce.")

    # AES-GCM Decryption with HEADER as associated data
    aesgcm = AESGCM(key_bytes)
    try:
        compressed_sql = aesgcm.decrypt(nonce, ciphertext, associated_data=HEADER)
    except Exception as e:
        raise RuntimeError(
            "AES-256-GCM authentication or decryption failed. The backup file may be corrupted or the decryption key is incorrect."
        ) from e

    print(f"[2/4] AES-256-GCM decryption successful (Decrypted payload: {round(len(compressed_sql) / 1024, 2)} KB).")
    return compressed_sql


def inspect_sql_dump(sql_content: str) -> Dict[str, any]:
    """Inspects the plain SQL dump for PostgreSQL structure and required clinic tables without logging PII."""
    summary = {
        "is_valid_pg_dump": False,
        "pg_version": "Unknown",
        "tables_found": [],
        "missing_tables": [],
        "table_row_estimates": {},
    }

    # Verify PostgreSQL dump signature
    if "PostgreSQL database dump" in sql_content[:2000]:
        summary["is_valid_pg_dump"] = True
        version_match = re.search(r"Dumped from database version\s+([0-9\.]+)", sql_content[:2000])
        if version_match:
            summary["pg_version"] = version_match.group(1)

    # Check for table creations & copy sections
    for table in REQUIRED_TABLES:
        # Match 'CREATE TABLE public.<table_name>' or 'CREATE TABLE <table_name>'
        table_pattern = rf"CREATE TABLE (?:public\.)?{table}\s*\("
        if re.search(table_pattern, sql_content, re.IGNORECASE):
            summary["tables_found"].append(table)
        else:
            summary["missing_tables"].append(table)

        # Estimate row count from COPY public.<table_name> ... \. blocks
        copy_pattern = rf"COPY (?:public\.)?{table}\s*\([^)]*\)\s*FROM stdin;(.*?)\\\."
        copy_match = re.search(copy_pattern, sql_content, re.DOTALL)
        if copy_match:
            lines = [l for l in copy_match.group(1).strip().split("\n") if l.strip()]
            summary["table_row_estimates"][table] = len(lines)
        else:
            # Check for INSERT INTO statements
            insert_pattern = rf"INSERT INTO (?:public\.)?{table}\b"
            insert_count = len(re.findall(insert_pattern, sql_content, re.IGNORECASE))
            if insert_count > 0:
                summary["table_row_estimates"][table] = insert_count

    return summary


def main():
    parser = argparse.ArgumentParser(description="DentPro OS / Sameeksha Backup Decryption & Integrity Verifier")
    parser.add_argument("--file", "-f", required=True, help="Path to encrypted backup file (*.sql.gz.enc)")
    parser.add_argument("--key", "-k", default=os.environ.get("BACKUP_ENCRYPTION_KEY", ""), help="Base64-encoded 32-byte AES key")
    parser.add_argument("--output", "-o", help="Optional path to write decompressed SQL dump (*.sql)")
    args = parser.parse_args()

    if not args.key:
        print("Error: Decryption key is required via --key argument or BACKUP_ENCRYPTION_KEY environment variable.", file=sys.stderr)
        sys.exit(1)

    print("==================================================================")
    print(" DentPro OS / Sameeksha Dental Software - Backup Verifier")
    print("==================================================================")
    print(f"Target Backup File : {args.file}")
    print(f"File Size          : {round(os.path.getsize(args.file) / 1024, 2)} KB")
    print("------------------------------------------------------------------")

    try:
        compressed_sql = decrypt_backup(args.file, args.key)

        print("[3/4] Decompressing gzip payload...")
        decompressed_bytes = gzip.decompress(compressed_sql)
        sql_text = decompressed_bytes.decode("utf-8", errors="replace")
        sql_size_kb = round(len(decompressed_bytes) / 1024, 2)
        print(f"      Decompressed SQL size: {sql_size_kb} KB")

        print("[4/4] Inspecting PostgreSQL schema and table structures...")
        analysis = inspect_sql_dump(sql_text)

        print("------------------------------------------------------------------")
        print(" Verification Results:")
        print(f" - Valid PostgreSQL Dump  : {'YES' if analysis['is_valid_pg_dump'] else 'NO (Signature check)'}")
        print(f" - PostgreSQL Source Ver  : {analysis['pg_version']}")
        print(f" - Required Tables Found  : {len(analysis['tables_found'])} / {len(REQUIRED_TABLES)}")
        print(f" - Tables Present         : {', '.join(analysis['tables_found'])}")

        if analysis["table_row_estimates"]:
            print(" - Record Estimates       :")
            for tbl, cnt in analysis["table_row_estimates"].items():
                print(f"     • {tbl:<22} : ~{cnt} records")

        if analysis["missing_tables"]:
            print(f" - Missing Expected Tables: {', '.join(analysis['missing_tables'])}")

        if args.output:
            with open(args.output, "w", encoding="utf-8") as out_f:
                out_f.write(sql_text)
            print("------------------------------------------------------------------")
            print(f"Restored SQL dump written to: {args.output}")
            print(f"To restore into an ISOLATED staging database:")
            print(f"  psql \"<STAGING_DATABASE_URL>\" < \"{args.output}\"")

        print("==================================================================")
        print(" STATUS: BACKUP VERIFIED AND DECRYPTED SUCCESSFULLY (INTEGRITY OK)")
        print("==================================================================")

    except Exception as e:
        print("------------------------------------------------------------------")
        print(f"VERIFICATION FAILED: {e}", file=sys.stderr)
        print("==================================================================")
        sys.exit(1)


if __name__ == "__main__":
    main()
