# Requirements

These draft requirements preserve the details extracted from the original
[user stories](../user/user_stories.md). Each requirement identifies its source story.
Functional requirements describe behavior; nonfunctional requirements describe interface,
security, or privacy constraints. Unspecified implementation details remain open.

## Functional Requirements

### FT-01: Inventory Browsing

| ID    | Requirement                                                                                                                                                                                    | Source |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | The website shall provide a Shop navigation control that opens the shop's inventory when selected.                                                                                             | US-01  |
| FR-02 | Hovering over the Shop navigation control shall display a drop-down menu of inventory categories.                                                                                              | US-02  |
| FR-03 | The category menu shall include individual flowers, arrangements (identical), arrangements (mixed), clearance, seasonal, flower health supplements, containers and vases, and accessory items. | US-02  |
| FR-04 | Selecting a category in the drop-down menu shall display the full list of items belonging to that category.                                                                                    | US-03  |
| FR-05 | Category listings shall include out-of-stock items.                                                                                                                                            | US-03  |
| FR-06 | Category listings shall include items on sale.                                                                                                                                                 | US-03  |
| FR-07 | Customers shall be able to sort category listings by price, season, color(s), holiday, and in-stock status.                                                                                    | US-04  |
| FR-08 | Customers shall be able to filter category listings by price, season, color(s), holiday, and in-stock status.                                                                                  | US-04  |

### FT-02: Shopping Cart and Purchasing

| ID    | Requirement                                                                                                              | Source |
| ----- | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| FR-09 | Selecting an item's plus (+) control shall add that item to the customer's shopping cart.                                | US-05  |
| FR-10 | After an item is added, the website shall display a sidebar containing the items in the customer's shopping cart.        | US-06  |
| FR-11 | The cart sidebar shall provide a Check Out button.                                                                       | US-07  |
| FR-12 | Selecting Check Out shall open the checkout page with the customer's cart contents.                                      | US-07  |
| FR-13 | Customers shall be able to change item quantities on the checkout page.                                                  | US-08  |
| FR-14 | Customers shall be able to remove items from their cart on the checkout page.                                            | US-08  |
| FR-15 | Selecting Confirm on the checkout page shall prompt the customer to select an available payment method.                  | US-09  |
| FR-16 | Pickup orders shall offer cash as a payment option.                                                                      | US-09  |
| FR-17 | Online payment options shall include credit card payments.                                                               | US-09  |
| FR-18 | Online payment options shall include cryptocurrency, Stripe, Klarna, PayPal, and Venmo.                                  | US-09  |
| FR-19 | After payment is completed, the website shall provide an invoice and receipt.                                            | US-10  |
| FR-20 | The invoice and receipt shall include the order number.                                                                  | US-10  |
| FR-21 | After payment is completed, the system shall email the invoice and receipt, including the order number, to the customer. | US-10  |

### FT-03: AI Assistance

| ID    | Requirement                                                                                                                                     | Source |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-22 | Selecting the AI chat icon shall open a conversation with an AI agent.                                                                          | US-11  |
| FR-23 | The AI agent shall have access to publicly available website information for answering customer questions.                                      | US-12  |
| FR-24 | The AI agent's shop information shall include store history, hours, location, and contact information.                                          | US-12  |
| FR-25 | Subject to the privacy constraints below, the AI agent shall have access to the customer's browsing history within the current website session. | US-13  |
| FR-26 | Subject to the privacy constraints below, the AI agent shall have access to the customer's current shopping cart contents.                      | US-13  |
| FR-27 | The AI agent shall use available session and cart context to answer questions about the customer's current shopping selections.                 | US-13  |

### FT-04: Staff Web Portal

| ID    | Requirement                                                                              | Source |
| ----- | ---------------------------------------------------------------------------------------- | ------ |
| FR-28 | Associates shall be able to log into the web portal and view the full shop inventory.    | US-15  |
| FR-29 | The inventory view shall display the quantity of each item.                              | US-15  |
| FR-30 | The inventory view shall display each item's cost of goods.                              | US-15  |
| FR-31 | The inventory view shall display each item's MSRP.                                       | US-15  |
| FR-32 | The inventory view shall display each item's current display price.                      | US-15  |
| FR-33 | Logged-in associates shall be able to view all pending orders.                           | US-16  |
| FR-34 | Each pending order shall display its invoice number.                                     | US-16  |
| FR-35 | Each pending order shall display its sale price.                                         | US-16  |
| FR-36 | Each pending order shall display the ordered items and their quantities.                 | US-16  |
| FR-37 | Logged-in administrators shall be able to add web portal users, including associates.    | US-17  |
| FR-38 | Logged-in administrators shall be able to delete web portal users, including associates. | US-17  |
| FR-39 | Logged-in administrators shall be able to issue refunds for transactions.                | US-18  |
| FR-40 | Logged-in administrators shall be able to modify transaction sale prices.                | US-18  |

## Nonfunctional Requirements

| ID     | Requirement                                                                                                        | Source |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------ |
| NFR-01 | The inventory navigation control shall be located at the top of the website.                                       | US-01  |
| NFR-02 | Each item shall have a plus (+) icon as its add-to-cart control.                                                   | US-05  |
| NFR-03 | The AI chat icon shall appear in the bottom-right corner of the web interface while the customer uses the website. | US-11  |
| NFR-04 | The AI agent shall not have access to customers' credit card numbers, names, phone numbers, or email addresses.    | US-14  |
| NFR-05 | The website shall not track customers' personal identifying information without their consent.                     | US-14  |
