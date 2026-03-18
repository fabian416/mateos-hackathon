#!/usr/bin/env python3
"""
tweet.py — Publica un tweet en Twitter/X.

Uso:
  python3 ~/tweet.py "Texto del tweet"

Usa las credenciales de Twitter de las variables de entorno:
  TWITTER_API_KEY, TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET
"""

import os
import sys

try:
    import requests
    from requests_oauthlib import OAuth1
except ImportError:
    print("Error: requests y requests-oauthlib son requeridos", file=sys.stderr)
    sys.exit(1)


def post_tweet(text):
    api_key = os.environ.get("TWITTER_API_KEY", "")
    api_secret = os.environ.get("TWITTER_API_SECRET", "")
    access_token = os.environ.get("TWITTER_ACCESS_TOKEN", "")
    access_secret = os.environ.get("TWITTER_ACCESS_TOKEN_SECRET", "")

    if not all([api_key, api_secret, access_token, access_secret]):
        print("Error: faltan credenciales de Twitter en las variables de entorno", file=sys.stderr)
        sys.exit(1)

    auth = OAuth1(api_key, api_secret, access_token, access_secret)

    for attempt in range(3):
        try:
            r = requests.post(
                "https://api.x.com/2/tweets",
                json={"text": text},
                auth=auth,
                timeout=30,
            )
            if r.status_code == 201:
                tweet_id = r.json().get("data", {}).get("id", "")
                handle = os.environ.get("TWITTER_HANDLE", "mateos")
                print(f"Tweet publicado: https://x.com/{handle}/status/{tweet_id}")
                return
            elif r.status_code in (400, 401, 403):
                print(f"Error {r.status_code}: {r.text}", file=sys.stderr)
                sys.exit(1)
            else:
                if attempt < 2:
                    continue
                print(f"Error {r.status_code}: {r.text}", file=sys.stderr)
                sys.exit(1)
        except requests.exceptions.RequestException as e:
            if attempt < 2:
                continue
            print(f"Error de conexión: {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 ~/tweet.py \"Texto del tweet\"", file=sys.stderr)
        sys.exit(1)
    text = sys.argv[1]
    if len(text) > 280:
        print(f"Error: tweet tiene {len(text)} caracteres (máximo 280)", file=sys.stderr)
        sys.exit(1)
    post_tweet(text)
