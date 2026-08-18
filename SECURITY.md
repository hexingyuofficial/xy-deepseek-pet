# Security policy

Please report vulnerabilities privately through GitHub Security Advisories. Do not include credentials, session content, or proof-of-concept data from another person in a public issue.

The supported surface will begin with the latest release. The desktop bridge must bind to loopback, authenticate every client, limit message size, validate protocol messages, and avoid persisting session content by default. Theme packs are untrusted data: they may contain declared image files only, cannot execute code, and cannot resolve paths outside their own directory.

