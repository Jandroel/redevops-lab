# Observability

Observability is how you understand what a system is doing after it starts running.

## Three Useful Signals

- Health checks: is the service alive?
- Logs: what happened?
- Metrics: how often, how slow, how many?

## Health Check

A health check is the minimum operational signal:

```txt
GET /health -> { "status": "ok" }
```

It does not replace logs, metrics, alerts, or tracing.

## Good First Questions

- Can I tell if the API started?
- Can I tell if a request failed?
- Can I tell if response time is getting worse?
- Do docs explain where to look during a release?

## Common Mistakes

- Logging secrets.
- Logging only generic messages.
- Adding a health endpoint that always returns OK even when dependencies fail.
- Claiming metrics exist before instrumentation is real.
