"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";

type Lang = "curl" | "javascript" | "python" | "go";

const API_URL = "https://api.yoverify.com";
const KEY_PLACEHOLDER = "yv_live_xxxxxxxxxxxxxxxxxxxx";

const snippets: Record<Lang, Record<string, string>> = {
  curl: {
    "Get verification types": `curl ${API_URL}/api/v1/verify/types`,

    "Submit a verification": `curl -X POST ${API_URL}/api/v1/verify \\
  -H "Authorization: Bearer ${KEY_PLACEHOLDER}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "verification_type": "identity",
    "subject": {
      "name": "Jane Smith",
      "id_number": "A1234567",
      "date_of_birth": "1990-05-15"
    },
    "reference": "user_789"
  }'`,

    "Check status": `curl ${API_URL}/api/v1/verify/{id} \\
  -H "Authorization: Bearer ${KEY_PLACEHOLDER}"`,

    "List all verifications": `curl "${API_URL}/api/v1/verify?limit=20&offset=0" \\
  -H "Authorization: Bearer ${KEY_PLACEHOLDER}"`,
  },

  javascript: {
    "Get verification types": `const res = await fetch('${API_URL}/api/v1/verify/types');
const { types } = await res.json();
console.log(types);`,

    "Submit a verification": `const res = await fetch('${API_URL}/api/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${KEY_PLACEHOLDER}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    verification_type: 'identity',
    subject: {
      name: 'Jane Smith',
      id_number: 'A1234567',
      date_of_birth: '1990-05-15',
    },
    reference: 'user_789',
  }),
});
const verification = await res.json();
console.log(verification.id, verification.status);`,

    "Check status": `const id = 'b3d7f12a-...';
const res = await fetch(\`${API_URL}/api/v1/verify/\${id}\`, {
  headers: { 'Authorization': 'Bearer ${KEY_PLACEHOLDER}' },
});
const { status, result } = await res.json();`,

    "Axios (Node.js)": `import axios from 'axios';

const yv = axios.create({
  baseURL: '${API_URL}/api/v1',
  headers: { Authorization: 'Bearer ${KEY_PLACEHOLDER}' },
});

// Submit
const { data } = await yv.post('/verify', {
  verification_type: 'identity',
  subject: { name: 'Jane Smith' },
  reference: 'user_789',
});

// Poll status
const { data: status } = await yv.get(\`/verify/\${data.id}\`);`,
  },

  python: {
    "Get verification types": `import requests

res = requests.get('${API_URL}/api/v1/verify/types')
print(res.json()['types'])`,

    "Submit a verification": `import requests

headers = {
    'Authorization': 'Bearer ${KEY_PLACEHOLDER}',
    'Content-Type': 'application/json',
}
payload = {
    'verification_type': 'identity',
    'subject': {
        'name': 'Jane Smith',
        'id_number': 'A1234567',
        'date_of_birth': '1990-05-15',
    },
    'reference': 'user_789',
}
res = requests.post('${API_URL}/api/v1/verify', json=payload, headers=headers)
verification = res.json()
print(verification['id'], verification['status'])`,

    "Check status": `import requests

headers = {'Authorization': 'Bearer ${KEY_PLACEHOLDER}'}
res = requests.get(f'${API_URL}/api/v1/verify/{verification_id}', headers=headers)
data = res.json()
print(data['status'], data.get('result'))`,

    "Python SDK pattern": `import requests
from dataclasses import dataclass

@dataclass
class YoVerify:
    api_key: str
    base_url: str = '${API_URL}/api/v1'

    @property
    def headers(self):
        return {'Authorization': f'Bearer {self.api_key}'}

    def verify(self, type_slug: str, subject: dict, ref: str = None):
        r = requests.post(f'{self.base_url}/verify', json={
            'verification_type': type_slug,
            'subject': subject,
            'reference': ref,
        }, headers=self.headers)
        r.raise_for_status()
        return r.json()

    def status(self, verification_id: str):
        r = requests.get(f'{self.base_url}/verify/{verification_id}', headers=self.headers)
        r.raise_for_status()
        return r.json()

yv = YoVerify(api_key='${KEY_PLACEHOLDER}')
v = yv.verify('identity', {'name': 'Jane Smith'}, ref='user_789')
print(v['id'])`,
  },

  go: {
    "Submit a verification": `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
)

const apiKey = "${KEY_PLACEHOLDER}"
const baseURL = "${API_URL}/api/v1"

func main() {
  body, _ := json.Marshal(map[string]interface{}{
    "verification_type": "identity",
    "subject": map[string]string{
      "name":      "Jane Smith",
      "id_number": "A1234567",
    },
    "reference": "user_789",
  })

  req, _ := http.NewRequest("POST", baseURL+"/verify", bytes.NewBuffer(body))
  req.Header.Set("Authorization", "Bearer "+apiKey)
  req.Header.Set("Content-Type", "application/json")

  resp, err := http.DefaultClient.Do(req)
  if err != nil { panic(err) }
  defer resp.Body.Close()
  fmt.Println("Status:", resp.Status)
}`,
  },
};

const langLabels: Record<Lang, string> = {
  curl: "cURL",
  javascript: "JavaScript",
  python: "Python",
  go: "Go",
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <button
        onClick={copy}
        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: "rgba(232,53,144,0.2)", color: "#e83590", border: "1px solid rgba(232,53,144,0.2)" }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="p-5 text-xs text-[rgba(237,237,237,0.75)] overflow-x-auto font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function IntegrationsPage() {
  const [lang, setLang] = useState<Lang>("javascript");
  const examples = snippets[lang];
  const firstKey = Object.keys(examples)[0];
  const [example, setExample] = useState<string>(firstKey);

  const handleLangChange = (l: Lang) => {
    setLang(l);
    setExample(Object.keys(snippets[l])[0]);
  };

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Integrations"
        subtitle="Code samples and guides for connecting your app to Yo Verify"
      />

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { step: "01", title: "Generate an API key", desc: "Create a key from the API Keys page and store it securely in your environment." },
          { step: "02", title: "Submit verifications", desc: "POST to /api/v1/verify with your subject data and a verification type slug." },
          { step: "03", title: "Poll or webhook", desc: "Check status with a GET request or receive push notifications via webhooks." },
        ].map(({ step, title, desc }) => (
          <GlassCard key={step} padding="p-5">
            <div className="text-xs font-bold tracking-widest text-[#e83590] mb-3">{step}</div>
            <div className="font-semibold text-[#ededed] text-sm mb-2">{title}</div>
            <div className="text-xs text-[rgba(237,237,237,0.45)] leading-relaxed">{desc}</div>
          </GlassCard>
        ))}
      </div>

      {/* Base URL + auth header */}
      <GlassCard className="mb-8" padding="p-5" style={{ borderColor: "rgba(24,195,244,0.15)", background: "rgba(24,195,244,0.04)" }}>
        <h3 className="text-sm font-semibold text-[#ededed] mb-3">Base URL &amp; Authentication</h3>
        <div className="flex flex-col gap-3 text-xs text-[rgba(237,237,237,0.65)] font-mono">
          <div>
            <span className="text-[rgba(237,237,237,0.35)]">Base URL: </span>
            <span className="text-[#18c3f4]">{API_URL}/api/v1</span>
          </div>
          <div>
            <span className="text-[rgba(237,237,237,0.35)]">Auth header: </span>
            <span>Authorization: Bearer &lt;your_api_key&gt;</span>
          </div>
          <div>
            <span className="text-[rgba(237,237,237,0.35)]">Content-Type: </span>
            <span>application/json</span>
          </div>
        </div>
      </GlassCard>

      {/* Code samples */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-[#ededed] mb-5">Code Samples</h3>

        {/* Language tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(Object.keys(snippets) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => handleLangChange(l)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                lang === l
                  ? { background: "rgba(232,53,144,0.15)", color: "#e83590", border: "1px solid rgba(232,53,144,0.25)" }
                  : { background: "rgba(255,255,255,0.04)", color: "rgba(237,237,237,0.45)", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              {langLabels[l]}
            </button>
          ))}
        </div>

        {/* Example tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {Object.keys(examples).map((k) => (
            <button
              key={k}
              onClick={() => setExample(k)}
              className="px-3 py-1 rounded-lg text-xs transition-all"
              style={
                example === k
                  ? { background: "rgba(24,195,244,0.12)", color: "#18c3f4", border: "1px solid rgba(24,195,244,0.2)" }
                  : { background: "rgba(255,255,255,0.03)", color: "rgba(237,237,237,0.4)", border: "1px solid rgba(255,255,255,0.05)" }
              }
            >
              {k}
            </button>
          ))}
        </div>

        <CodeBlock code={examples[example] ?? ""} />
      </GlassCard>

      {/* Response schema */}
      <GlassCard className="mt-6">
        <h3 className="text-sm font-semibold text-[#ededed] mb-4">Response Schema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[rgba(237,237,237,0.35)] mb-3 font-semibold uppercase tracking-wider">Verification object</div>
            <CodeBlock
              code={JSON.stringify({
                id: "b3d7f12a-...",
                status: "pending | processing | completed | failed | rejected",
                verification_type: "identity",
                reference: "user_789",
                result: null,
                admin_notes: null,
                created_at: "2026-05-11T10:00:00Z",
                updated_at: "2026-05-11T10:05:00Z",
              }, null, 2)}
            />
          </div>
          <div>
            <div className="text-xs text-[rgba(237,237,237,0.35)] mb-3 font-semibold uppercase tracking-wider">Status lifecycle</div>
            <div className="flex flex-col gap-2">
              {[
                { status: "pending", desc: "Submitted, awaiting processing" },
                { status: "processing", desc: "Under active review" },
                { status: "completed", desc: "Verification passed" },
                { status: "failed", desc: "Verification could not complete" },
                { status: "rejected", desc: "Rejected — see admin_notes" },
              ].map(({ status, desc }) => (
                <div key={status} className="flex items-start gap-3 text-xs">
                  <span className="font-mono text-[#18c3f4] w-20 flex-shrink-0">{status}</span>
                  <span className="text-[rgba(237,237,237,0.45)]">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
