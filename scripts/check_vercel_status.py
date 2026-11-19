import json
import urllib.request

with open(r'C:\Users\alejandratesara\AppData\Roaming\com.vercel.cli\Data\auth.json') as f:
    token = json.load(f)['token']

req = urllib.request.Request(
    'https://api.vercel.com/v6/deployments?projectId=prj_fJpD465ix4Cppx0dkKal5GEePDHS&limit=5',
    headers={'Authorization': f'Bearer {token}'}
)

with urllib.request.urlopen(req) as resp:
    data = json.load(resp)
    for d in data['deployments']:
        commit = d.get('meta', {}).get('githubCommitSha', '')[:7]
        msg = d.get('meta', {}).get('githubCommitMessage', '')
        state = d.get('state')
        uid = d.get('uid')
        url = d.get('url')
        print(f"ID: {uid} | State: {state} | Commit: {commit} | Msg: {msg} | URL: https://{url}")
