---
title: 'Test a CVC change inside a consumer app'
description: 'Test a CVC change inside a consumer app'
order: 7
---

# Test a CVC change inside a consumer app

Use the local flow from the decisions file:

1. Test the component in the CVC playground.
2. Run the CVC build for the local package through `prepack`.
3. Install the local package in the consumer application.
4. Test the consumer application in the browser.

For editable-table specifically, the decisions file says it has CVC only as a dev dependency and uses the host application's CVC at runtime. Do not force a re-release just for that note, but declare a peer dependency range so a CVC break cannot silently break it. In the future split, editable-table should consume `@psvcommon/ui`.
