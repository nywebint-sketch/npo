import urllib.request
import json

url = 'https://rvswpgsxutfcpgvmzonr.supabase.co/rest/v1/events?select=id,title'
headers = {
    'apikey': 'sb_publishable_lW73N7V05vOTquEuPSudHQ_9qv9IjOE',
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print("EVENTS:", response.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
