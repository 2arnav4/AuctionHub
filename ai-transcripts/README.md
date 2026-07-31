# AI Transcripts

Raw Claude Code session transcripts for this project, plus [`ai-usage-summary.md`](ai-usage-summary.md).

## Files

| File | Size | Session |
|---|---|---|
| `claude-session-1-initial-build.jsonl` | 640K | Initial build — structure, models, realtime wiring |
| `claude-session-2-deployment-and-refactor.jsonl` | 2.2M | Deployment, auth rework, restructure |
| `claude-session-3-audit-and-hardening.jsonl` | 2.7M | Audit, concurrency fixes, docs, tests |

## Format

These are the unmodified JSONL transcripts Claude Code writes to
`~/.claude/projects/<project>/<session-id>.jsonl`, as described in the
[Claude Code session documentation](https://code.claude.com/docs/en/sessions).

Each line is a JSON object representing one message — user prompts, assistant
responses, tool calls, and tool results — in order. To read one as prose:

```bash
# every prompt I sent, in order
jq -r 'select(.type=="user") | .message.content
       | if type=="string" then . else (.[]? | select(.type=="text") | .text) end' \
  claude-session-3-audit-and-hardening.jsonl
```

## Redaction

The only modification is secret redaction, which the assignment permits. Replaced:

- MongoDB connection string credentials → `mongodb+srv://<REDACTED>:<REDACTED>@`
- `JWT_SECRET` values → `JWT_SECRET=<REDACTED>`
- Signed JWTs appearing in HTTP responses → `<REDACTED_JWT>`

Verified afterwards that no occurrence of any of the above survives in these files.
No prompts, responses, tool calls, or results were removed, reordered, or rewritten.
