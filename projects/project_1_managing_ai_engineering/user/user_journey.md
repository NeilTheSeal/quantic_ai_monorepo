# User Journey: Finding Flowers with AI Assistance

Alex is a first-time visitor looking for pink roses as a birthday gift. The goal is to find
available flowers and proceed to checkout. This exemplifies a single feature (FT-01) in the feature suite.

| Step         | User action                                                                             | System response                                                                     | Related stories     |
| ------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------- |
| 1. Visit     | Alex opens the website and selects Shop.                                                | Displays the flower catalog.                                                        | US-01               |
| 2. Search    | Alex searches for roses.                                                                | Displays matching flowers with prices and availability.                             | US-03               |
| 3. Ask AI    | Unsure which colors are available, Alex opens chat and asks, "Are pink roses in stock?" | Checks current inventory, confirms availability, and links to the matching flowers. | US-11, US-12        |
| 4. Check out | Alex adds the pink roses to the cart and clicks "Check Out."                            | Updates the cart sidebar, then opens the checkout page. The journey ends here.      | US-05, US-06, US-07 |

If pink roses are unavailable, the AI suggests an available color so Alex can choose an alternative
and continue to checkout.
