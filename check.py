import urllib.request
import json

url = 'https://rvswpgsxutfcpgvmzonr.supabase.co/rest/v1/profiles?select=*'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2c3dwZ3N4dXRmY3Bndm16b25yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4NDUxMSwiZXhwIjoyMDg4NjYwNTExfQ.vxZtV2j3_5O0qFZjIWeMgUARUhkxFO8vyKMLYhb-GmY',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2c3dwZ3N4dXRmY3Bndm16b25yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4NDUxMSwiZXhwIjoyMDg4NjYwNTExfQ.vxZtV2j3_5O0qFZjIWeMgUARUhkxFO8vyKMLYhb-GmY'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print("PROFILES:")
        print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
