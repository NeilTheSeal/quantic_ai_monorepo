# Lily's Florist: Managing AI Engineering Project

## Introduction

This project outlines a proposed website for Lily's Florist to simplify online flower
ordering, support inventory and order management, and provide AI customer assistance.
The following sections bring together the interview synopsis, system requirements, user
stories, and a user journey. The full interview and project checklist appear as appendices.

## Synopsis

### Key Topics and Responses

- **Pain points:** Manual order entry and stock tracking cause missed details, duplicate orders,
  and overselling; repetitive inquiries interrupt staff during busy periods.
- **Business goals:** Simplify online ordering, reduce administrative work, and grow the business
  while preserving personal customer service.
- **Sales and service targets:** Increase online sales by 15–20% in year one and 30–40% within
  three years, achieve 90% customer satisfaction, and automate 70% of routine inquiries.
- **Efficiency targets:** Cut order-processing time by at least 50% and flower waste by 25%,
  while growing normal daily orders from 20–30 to 40–50.

### Categories of User's Requirements

- **User groups:** Customers and visitors need shopping and support tools; florists, delivery
  staff, and Lily need role-appropriate operational access, while event customers need quotes.
- **Functional requirements:** Support browsing, ordering, payments, scheduling, inventory,
  notifications, staff workflows, and AI assistance.
- **Nonfunctional requirements:** Provide secure, reliable, mobile-friendly service with screen
  reader and keyboard support, readable interfaces, and English and Spanish at launch.
- **Privacy and AI boundaries:** Verify identity before exposing order details and restrict staff
  access by role; AI must not independently change orders or issue refunds.

### Website Features

- **Shopping and payment:** Offer guest checkout, arrangement options, extras, and basic discount
  codes, with cards and digital wallets online or cash/card for pickup.
- **Fulfillment:** Offer delivery within 15 miles, capacity-controlled slots, and bookings up to
  30 days ahead, with automatic email updates, optional SMS, and secure guest tracking links.
- **Inventory and exceptions:** Reserve stock for 15 minutes during checkout, track stock through
  preparation, and support payment retries, approved substitutions, cancellations, and refunds.
- **AI support:** Answer routine questions around the clock using maintained shop information and
  live stock/order data, with staff handoff or next-business-day follow-up when needed.
- **Content and administration:** Include Home, Shop, Gallery, About Us, Contact, Delivery & FAQs,
  and Order Tracking, plus staff tools for orders, inventory, deliveries, and content updates.

### Constraints

- **Schedule:** Lily prefers a January 15, 2027 launch, allowing testing and staff training before
  Valentine's Day.
- **Budget:** Initial spending is $12,000–$18,000, with approximately $300–$500 monthly for
  hosting, maintenance, and AI services.
- **Capacity and continuity:** Support 150–200 daily orders during peaks with simple workflows
  for a small team and minimal disruption to ongoing business.
- **Existing systems:** Retain Square and Gmail, connect online payments to Square if possible,
  and preserve existing customer records and product information during migration.

### Other Relevant Information

- **Release priorities:** Launch ordering, scheduling, inventory, staff tools, and basic AI support
  first; defer accounts, loyalty automation, event booking, blogging, and forecasting to Version 2.
- **Content ownership:** Lily maintains prices, policies, promotions, and FAQs, while florists
  maintain product details and availability; listings are reviewed weekly and seasonally refreshed.
- **Clarifications needed:** Confirm how unpaid pickup orders enter the staff workflow and reserve
  stock, and whether AI recommendations belong at launch or in Version 2.

Source: [Full interview transcript](#appendix-a-interview-with-lily).

## Requirements

These draft requirements preserve the details extracted from the original
[user stories](#user-stories). Each requirement identifies its source story.
Functional requirements describe behavior; nonfunctional requirements describe interface,
security, or privacy constraints. Unspecified implementation details remain open.

### Functional Requirements

#### FT-01: Inventory Browsing

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

#### FT-02: Shopping Cart and Purchasing

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

#### FT-03: AI Assistance

| ID    | Requirement                                                                                                                                     | Source |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-22 | Selecting the AI chat icon shall open a conversation with an AI agent.                                                                          | US-11  |
| FR-23 | The AI agent shall have access to publicly available website information for answering customer questions.                                      | US-12  |
| FR-24 | The AI agent's shop information shall include store history, hours, location, and contact information.                                          | US-12  |
| FR-25 | Subject to the privacy constraints below, the AI agent shall have access to the customer's browsing history within the current website session. | US-13  |
| FR-26 | Subject to the privacy constraints below, the AI agent shall have access to the customer's current shopping cart contents.                      | US-13  |
| FR-27 | The AI agent shall use available session and cart context to answer questions about the customer's current shopping selections.                 | US-13  |

#### FT-04: Staff Web Portal

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

### Nonfunctional Requirements

| ID     | Requirement                                                                                                        | Source |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------ |
| NFR-01 | The inventory navigation control shall be located at the top of the website.                                       | US-01  |
| NFR-02 | Each item shall have a plus (+) icon as its add-to-cart control.                                                   | US-05  |
| NFR-03 | The AI chat icon shall appear in the bottom-right corner of the web interface while the customer uses the website. | US-11  |
| NFR-04 | The AI agent shall not have access to customers' credit card numbers, names, phone numbers, or email addresses.    | US-14  |
| NFR-05 | The website shall not track customers' personal identifying information without their consent.                     | US-14  |

## User Stories

### Project Epic

#### We want to create a simple online flower-ordering experience for Lily's Florist Shop, where customers can easily browse inventory, save their selection, pay for their order, track previous orders, and receive AI assistance when needed in a responsive web interface. Lily's Florist Shop employees should be able to track orders and inventory, schedule deliveries, and access workflows and shop tools to support their roles

### Project Features and User Stories

**Note from the author**: this is a variation (and simplification) on how we write features and user stories at my job and how I learned to write them in school. Any discrepancies between how these are written and Quantic's convention are a matter of taste and company culture.

#### FT-01: As a Lily's Florist Customer, I want to be able to browse the shop's inventory with integrated search functionality

- **US-01:** As a Lily's Florist Customer, I want navigation at the top of the website, so that I can navigate to the shop's inventory.

- **US-02:** As a Lily's Florist Customer, I want to browse inventory categories, so that I can find the types of items I am looking for.

- **US-03:** As a Lily's Florist Customer, I want to see the full list of items in an inventory category, so that I can explore the shop's selection and availability.

- **US-04:** As a Lily's Florist Customer, I want to sort and filter inventory, so that I can find items that match my preferences.

#### FT-02: As a Lily's Florist Customer, I want to be able to purchase items from the online shop using a friendly user interface and secure payment

- **US-05:** As a Lily's Florist Customer, I want to add items to my shopping cart, so that I can save my selection for purchase.

- **US-06:** As a Lily's Florist Customer, I want to see the items in my shopping cart, so that I can keep track of my selection.

- **US-07:** As a Lily's Florist Customer, I want to proceed to checkout from my shopping cart, so that I can purchase my selected items.

- **US-08:** As a Lily's Florist Customer, I want to modify my order at checkout, so that I can adjust my selection before purchasing.

- **US-09:** As a Lily's Florist Customer, I want to pay using a variety of available methods, so that I can complete my purchase using a method that works for me.

- **US-10:** As a Lily's Florist Customer, I want an invoice and receipt with an order number, so that I have a record of my purchase.

#### FT-03: As a Lily's Florist Customer, I want to have AI assistance when using the website

- **US-11:** As a Lily's Florist Customer, I want to chat with an AI agent while using the website, so that I can get assistance when needed.

- **US-12:** As a Lily's Florist AI Agent, I want access to publicly available website and store information, so that I can answer customers' questions about the shop.

- **US-13:** As a Lily's Florist AI Agent, I want context about a customer's shopping experience, so that I can provide helpful information specific to their visit.

- **US-14:** As a Lily's Florist Customer, I want control over the use of my personal identifying information, so that I can receive AI assistance while protecting my privacy.

#### FT-04: As a Lily's Florist Associate, I want to have assistive technology for my job

- **US-15:** As a Lily's Florist Associate, I want to view the full shop inventory, so that I can check stock quantities and pricing information for my job.

- **US-16:** As a Lily's Florist Associate, I want to view pending orders, so that I can see what customers have ordered and support order preparation.

- **US-17:** As a Lily's Florist Administrator, I want to manage web portal users, so that I can maintain access for associates and other users.

- **US-18:** As a Lily's Florist Administrator, I want to modify transactions, so that I can manage refunds and sale price adjustments.

## User Journey: Finding Flowers with AI Assistance

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

## Appendix A: Interview with Lily

### Conversation

**Full conversation available [at this link](https://chatgpt.com/share/6ade3893-87ec-83e8-87d3-2262c4c1e003)**

#### 1. Neil

Hi Lily, I'm Neil, a website developer, and I am going to help you with your new, state-of-the-art
website, with AI integration and e-commerce integration. Can I ask you a few questions about your
site?

#### 2. Lily

Hi Neil! 🌸 It's lovely to meet you, and I'm delighted to have you helping me create a new website
for Lily's Florist!

I've been running my flower shop for over 10 years, and I'm excited about bringing more of my
business online.

I'm particularly interested in making ordering flowers easier for my customers, managing my growing
number of orders, and using AI to improve customer service.

I'm happy to answer your questions and share my ideas about what I'd love the website to do! 🌷

#### 3. Neil

What are your short-term and long-term goals for the website?

#### 4. Lily

Hi Neil! 🌸 I'm glad you asked! I have some clear goals for Lily's Florist.

**Short-term goals (first 6–12 months):**

- Launch an attractive, easy-to-use website with online ordering and secure payments.

- Allow customers to schedule deliveries and pickups.

- Manage orders and flower inventory more efficiently.

- Introduce AI customer support to answer common questions 24/7.

- Showcase my floral arrangements through a beautiful gallery.

**Long-term goals (1–3 years):**

- Increase online sales by 30–40% and attract new customers.

- Introduce customer accounts, loyalty rewards, and personalized recommendations.

- Expand delivery services and grow my wedding and corporate event business.

- Use sales trends to forecast demand and reduce flower waste.

- Build a stronger online presence through seasonal promotions, social media, and a flower care
  blog.

Ultimately, I want the website to help my business grow while maintaining the personal touch my
customers love! 🌷

#### 5. Neil

How will you judge whether the site is successful, and what measurable improvements would you like
to see compared with today?

#### 6. Lily

Hi Neil! 🌸 For me, success means more sales, happier customers, and less time spent on paperwork!

I'd like to measure these improvements against today's performance:

- Online sales: Increase sales by 15–20% in the first year and 30–40% within three years.

- Order processing: Reduce the time spent handling each order by at least 50%.

- Customer satisfaction: Achieve a 90% satisfaction rating and encourage repeat purchases.

- Inventory management: Reduce flower waste by 25% through better stock tracking.

- AI customer support: Automatically answer at least 70% of routine customer inquiries.

- Order capacity: Increase our normal 20–30 daily orders to 40–50, while comfortably handling 100+
  during holidays.

Most importantly, I'll consider the website successful if it helps Lily's Florist grow without
losing the personal, caring service my customers love! 🌷

#### 7. Neil

Which parts of handling orders, managing inventory, and answering customer questions cause the most
frustration today? Can you describe a recent example?

#### 8. Lily

Hi Neil! 🌸 My biggest frustrations are the amount of manual work and the difficulty keeping
everything organized, especially during busy periods!

- Order management: I currently handle orders through phone calls, in-store visits, and a basic
  online form. Manually recording everything takes time and sometimes leads to missed details or
  duplicate orders.

- Inventory management: I track flower stock manually, making it difficult to know exactly what's
  available. Sometimes I accept orders without realizing certain flowers are running low.

- Customer inquiries: My staff and I repeatedly answer questions about prices, flower availability,
  delivery times, and opening hours, taking us away from arranging flowers.

A recent example: Last Mother's Day, we received over 100 orders in one day. We accidentally
accepted several orders for pink peonies after running out of stock. I had to contact customers,
suggest alternatives, and reorganize deliveries.

I'd love a website that automatically updates inventory, keeps orders organized, and uses AI to
answer routine questions, allowing me to spend more time creating beautiful arrangements! 🌷

#### 9. Neil

Who will use the site, including customers and staff, and what does each group need to accomplish?

#### 10. Lily

Hi Neil! 🌸 I expect several groups of people to use Lily's Florist's website, each with different
needs.

- Customers: Browse arrangements, place orders, pay securely, schedule deliveries or pickups, track
  orders, and earn loyalty rewards.

- Florists and shop staff: View incoming orders, check special requests, update order statuses, and
  manage daily flower inventory.

- Delivery staff: View delivery addresses, schedules, special instructions, and mark deliveries as
  completed.

- Me (shop owner): Manage products, prices, inventory, promotions, staff access, and review sales
  reports.

- Event customers: Request quotes for weddings, corporate events, and other special occasions.

- Website visitors: Explore our gallery, read flower care tips, check opening hours, and receive
  assistance through AI customer support.

My priority is making the website simple for customers while giving my staff the tools to manage
busy days efficiently. I'd also like each staff member to access only the information needed for
their role! 🌷

#### 11. Neil

Which capabilities are essential for launch, and which could wait for a later version?

#### 12. Lily

Hi Neil! 🌸 I'd like to prioritize features that help us manage orders efficiently and give customers
a smooth shopping experience.

**Essential for launch (Version 1):**

- Online ordering with secure payments and simple checkout.

- Delivery and pickup scheduling with order confirmations.

- Inventory tracking that automatically updates when orders are placed.

- Staff dashboard to manage orders, stock, and deliveries.

- AI customer support for common questions, with the option to contact staff.

- Mobile-friendly website with a floral gallery, contact details, and opening hours.

**Features for later versions (Version 2):**

- Customer accounts, order history, and loyalty rewards.

- Personalized AI flower recommendations.

- Wedding and corporate event booking tools.

- Blog, seasonal promotions, and social media integration.

- Advanced sales reports and inventory forecasting.

My main priority: I want Version 1 to prevent overselling flowers, reduce manual work, and make
ordering easier. We can introduce more sophisticated features once the essentials are working
reliably! 🌷

#### 13. Neil

Could you walk me through an ideal customer visit, from arriving on the site to receiving an order,
including what the customer should see at each step?

#### 14. Lily

Hi Neil! 🌸 I'd love customers to have a simple, enjoyable shopping experience from start to finish!

- Homepage: Customers see beautiful floral arrangements, seasonal specials, and clear Shop Now
  options.

- Browsing: They explore bouquets by occasion, price, or flower type, with photos, descriptions,
  prices, and availability.

- Selecting: They choose an arrangement, size, quantity, and optional extras such as chocolates or a
  greeting card.

- Checkout: They enter recipient details, a personal message, and choose delivery or pickup with an
  available date and time.

- Payment: They review the total cost, pay securely, and receive an immediate order confirmation by
  email.

- Order preparation: Customers receive updates when our florists begin preparing their flowers.

- Delivery: They receive notification when their order is out for delivery and confirmation once it
  arrives.

- After delivery: Customers can leave feedback and receive flower care tips.

My biggest priority is ensuring customers always see accurate flower availability, clear pricing,
and reliable delivery information. I'd also love AI assistance throughout their visit to help them
choose the perfect flowers! 🌷

#### 15. Neil

What products and services should customers be able to order online, and what choices or details are
needed for custom arrangements or event orders?

#### 16. Lily

Hi Neil! 🌸 I'd love customers to be able to order our full range of flowers and services online!

**Products and services:**

- Bouquets: Birthday, anniversary, sympathy, romantic, and seasonal arrangements.

- Floral gifts: Roses, mixed bouquets, potted plants, chocolates, balloons, and greeting cards.

- Special occasions: Wedding flowers, corporate arrangements, centerpieces, and event decorations.

- Subscriptions: Weekly or monthly flower deliveries for homes and businesses.

- Custom arrangements: Customers should specify their budget, preferred flowers, colors, occasion,
  arrangement size, delivery date, personal message, and any flowers to avoid. They should also be
  able to upload inspiration photos.

- Wedding and event orders: I'd need the event date, venue, estimated guest count, types and
  quantities of arrangements, color theme, budget, and setup requirements. Customers should be able
  to request a personalized quote rather than paying immediately.

My priority: Standard arrangements should be available for immediate online purchase, while custom
and event orders should allow me to review requests, confirm flower availability, and provide
accurate pricing before accepting payment. 🌷

#### 17. Neil

Will customers pay directly on the site, pay in person, or have both options? Which payment methods
should be available?

#### 18. Lily

Hi Neil! 🌸 I'd love to offer both online and in-person payments so customers can choose what works
best for them.

**Payment options I'd like to offer:**

- Credit/debit cards: Visa, Mastercard, American Express, and Discover.

- Digital wallets: Apple Pay and Google Pay for convenient checkout.

- In-store payments: Cash or card for customers collecting their orders.

- Event orders: Deposits online, with the remaining balance paid before the event.

**My preferences:**

- Online delivery orders should require full payment before preparation.

- Customers choosing pickup can pay online or in-store.

- Payments must be secure, with immediate email receipts and confirmations.

- Refunds and cancellations should be easy for me to manage.

My priority is making payments convenient, secure, and straightforward for both customers and staff!
🌷

#### 19. Neil

If a payment fails or the customer leaves checkout before finishing, what should happen to the
order, any reserved inventory, and the customer's progress?

#### 20. Lily

Hi Neil! 🌸 I'd like failed payments and abandoned checkouts to be handled smoothly, without
frustrating customers or causing inventory problems.

- Failed payments: The order should remain pending, not confirmed. Customers should see a friendly
  error message and be able to retry or choose another payment method.

- Reserved inventory: Flowers should be temporarily reserved for 15 minutes during checkout. If
  payment isn't completed, the stock should automatically become available again.

- Abandoned checkout: Customers should be able to return and continue where they left off, provided
  their selected flowers are still available.

- Saved progress: Their cart, delivery details, and personal messages should be preserved, but
  payment card information shouldn't be stored.

- Reminders: Customers who have provided their email and agreed to reminders could receive a gentle
  reminder about their unfinished order.

- Staff notifications: I'd like staff alerted if a payment is received but the order isn't
  confirmed, so we can resolve it quickly.

My priority is preventing accidental double payments, overselling flowers, and losing potential
customers because of checkout difficulties! 🌷

#### 21. Neil

What delivery and pickup options should customers have, including service areas, fees, cutoff times,
and available dates or time slots?

#### 22. Lily

Hi Neil! 🌸 I'd like to offer flexible delivery and pickup options while keeping scheduling
manageable for my staff.

- Delivery areas: Local delivery within 15 miles of the shop, with address eligibility checked
  during checkout.

- Delivery fees: $8 within 5 miles, $12 for 5–10 miles, and $18 for 10–15 miles. Free delivery for
  orders over $100 within 10 miles.

- Delivery times: Monday–Saturday, with morning (9 AM–12 PM) and afternoon (12 PM–5 PM) slots.

- Cutoff times: Same-day delivery for orders placed before 11 AM, subject to flower availability and
  delivery capacity.

- Store pickup: Free pickup Monday–Saturday, 9 AM–6 PM, with at least two hours' preparation time.

- Future bookings: Customers should be able to schedule deliveries or pickups up to 30 days ahead.

My priority: The website should display only available dates and time slots, automatically prevent
overbooking, and allow me to adjust delivery capacity during busy holidays like Valentine's Day and
Mother's Day! 🌷

#### 23. Neil

If a requested delivery time is unavailable, a delivery fails, or an order is delayed, what should
the customer be told and what alternatives should they have?

#### 24. Lily

Hi Neil! 🌸 I want customers to feel informed and reassured whenever delivery problems occur.

- Unavailable delivery time: The website should immediately explain that the slot is fully booked
  and suggest the next available time, another date, or free store pickup.

- Delayed orders: Customers should receive an email or SMS explaining the delay, the updated
  estimated delivery time, and how to contact us.

- Failed deliveries: If nobody is available or the address is incorrect, our driver should contact
  the customer and notify the shop.

- Alternative arrangements: Customers should be able to request redelivery, reschedule, or arrange
  store pickup. Any additional delivery fees must be explained beforehand.

- Refunds and cancellations: If we cannot fulfill an order as promised, I'd like to offer a suitable
  alternative or a full refund.

My priority: Staff should be alerted immediately when something goes wrong, and customers should
never be left wondering where their flowers are. I'd also like to personally handle serious delivery
complaints to maintain our reputation for excellent service! 🌷

#### 25. Neil

How should customers request order changes, cancellations, or refunds, and what restrictions should
apply once preparation or delivery has begun?

#### 26. Lily

Hi Neil! 🌸 I'd like customers to have a simple way to request changes, cancellations, or refunds
while protecting my shop from unnecessary flower waste.

- Requesting changes: Customers should use a link in their confirmation email or contact us by phone
  to update delivery details, messages, or arrangements.

- Before preparation: Changes and cancellations should be free if requested at least 24 hours before
  the scheduled delivery or pickup.

- Once preparation begins: Changes should require staff approval, and cancellations may receive only
  a partial refund depending on flowers and materials already used.

- During delivery: Customers cannot cancel or change the delivery address without contacting us.
  Redelivery fees may apply.

- Refund requests: Customers should submit requests through the website, ideally within 48 hours of
  delivery, with photos if flowers arrive damaged.

- Staff approval: I'd like to personally review refunds and exceptions, with customers notified by
  email of the decision.

My priority: Customers should clearly understand our policies before checkout, while I retain
flexibility to resolve genuine problems fairly. If an error is ours, I'd offer a replacement or full
refund! 🌷

#### 27. Neil

Could you walk me through how staff should receive, prepare, and complete an order, including how
inventory should change along the way?

#### 28. Lily

Hi Neil! 🌸 I'd love a clear, step-by-step process that keeps my team organized and prevents
inventory mistakes.

- Order received: Staff get an alert when payment is confirmed. The order appears on our dashboard
  with customer details, flowers, special requests, and delivery information.

- Inventory reserved: Required flowers and supplies are automatically reserved when the order is
  confirmed, reducing available stock so we don't oversell.

- Order preparation: A florist marks the order as In Preparation, follows the arrangement
  instructions, and records any substitutions or additional materials used.

- Inventory updated: Once preparation is complete, the reserved flowers are deducted from physical
  stock. Any unused flowers return to available inventory.

- Ready for delivery/pickup: Staff mark the order Ready, triggering a customer notification.

- Order completed: Delivery staff confirm delivery, or shop staff confirm pickup. The customer
  receives a completion notification.

- For cancellations: Reserved stock should be released if preparation hasn't started. Once flowers
  have been used, staff should record what can be reused and what must be written off.

My priority: I'd like everyone to see the order's current status and accurate inventory levels,
especially when we're handling 100+ orders during holidays! 🌷

#### 29. Neil

If an item becomes unavailable before or after checkout, how should substitutions or refunds work,
and when must the customer approve a change?

#### 30. Lily

Hi Neil! 🌸 Flower availability can change quickly, so I'd like a fair and transparent substitution
process.

- Before checkout: Unavailable flowers should be clearly marked, with similar arrangements or
  alternative flowers suggested. Customers shouldn't be able to order out-of-stock items.

- After checkout: If a flower becomes unavailable, staff should be alerted immediately and offer a
  similar flower of equal or greater value at no extra cost.

- Customer approval: Customers must approve changes involving flower types, colors, arrangement
  style, or additional charges. Minor greenery substitutions can be made without approval.

- Notifications: Customers should receive an email or SMS showing the proposed substitution, any
  price difference, and a simple way to approve or reject it.

- No response: If customers don't respond before the preparation deadline, staff should contact them
  directly rather than make significant changes without permission.

- Refunds: If no suitable alternative is accepted, customers should receive a full refund for the
  unavailable arrangement or item.

My priority: The website must update inventory correctly, release unused flowers, and record all
substitutions and customer approvals. I never want customers disappointed by receiving flowers they
didn't agree to! 🌷

#### 31. Neil

What confirmations and order-status updates should customers receive, through which channels, and
how should they check progress themselves?

#### 32. Lily

Hi Neil! 🌸 I'd like customers to receive clear, timely updates without being overwhelmed by
messages.

- Order confirmation: Immediate email with order number, payment receipt, arrangement details,
  delivery or pickup date, and personal message.

- Order preparation: Email or optional SMS when our florists begin preparing the arrangement.

- Ready for pickup: Email or SMS confirming the flowers are ready, including collection
  instructions.

- Out for delivery: SMS or email with an estimated delivery window.

- Order completed: Confirmation when flowers are delivered or collected, followed by optional flower
  care tips.

- Problems or changes: Immediate notifications about delays, substitutions, failed deliveries, or
  refunds requiring attention.

- Order tracking: Every confirmation email should include a secure tracking link so customers can
  check their order status without creating an account. Registered customers could eventually view
  their full order history.

My priority: Email notifications should be automatic, SMS should be optional, and staff should be
able to see which notifications were sent. I'd also like customers to receive important updates even
if they opt out of promotional messages! 🌷

#### 33. Neil

Should customers be able to check out as guests, create accounts, or both? What should an account
let them do that a guest cannot?

#### 34. Lily

Hi Neil! 🌸 I'd definitely like to offer both guest checkout and customer accounts, giving customers
the flexibility to choose.

- Guest checkout: Customers can browse, order, pay securely, schedule deliveries, and track orders
  without registering.

- Customer accounts: Customers can save delivery addresses, recipient details, and preferences for
  faster future purchases.

- Order history: Registered customers can view previous orders, track current deliveries, and easily
  reorder favorite arrangements.

- Loyalty rewards: Account holders can earn points, redeem discounts, and access exclusive
  promotions.

- Personalization: Customers can save favorite arrangements, important dates like birthdays and
  anniversaries, and choose whether to receive reminders.

- Account security: Customers should be able to update their details, reset passwords, and manage
  communication preferences.

My priority: Guest checkout is essential for launch, while full customer accounts and loyalty
rewards can be introduced in Version 2. I never want customers forced to create an account just to
buy flowers! 🌷

#### 35. Neil

Do you offer promotions or a rewards program, and what rules should the site apply when a customer
tries to use an expired, invalid, or incompatible offer?

#### 36. Lily

Hi Neil! 🌸 Yes! I offer seasonal promotions and a loyalty rewards program to thank my regular
customers.

- Promotions: Discount codes, seasonal specials, referral bonuses, and occasional free delivery
  offers.

- Loyalty rewards: Customers earn 1 point per $1 spent, with 100 points redeemable for a $5
  discount.

- Expired or invalid codes: The website should display a friendly explanation and allow customers to
  enter another code without losing their cart.

- Incompatible offers: Only one promotional code should apply per order. Loyalty points cannot be
  combined with other discounts.

- Restrictions: Some offers may exclude wedding packages, custom event orders, and peak holidays
  such as Valentine's Day.

- Refunds: Points earned from refunded purchases should be reversed, while redeemed points should be
  returned when appropriate.

My priority: Customers should see their savings clearly before payment, and discounts should never
apply incorrectly. I'd like to manage promotions myself, with basic discount codes available at
launch and automated loyalty rewards introduced in Version 2! 🌷

#### 37. Neil

What tools currently handle your website, payments, orders, inventory, and customer records, and
which need to connect to the new site or remain in use?

#### 38. Lily

Hi Neil! 🌸 At the moment, Lily's Florist uses fairly basic tools, and I'd love to bring everything
together!

- Website: A simple website with a contact form, gallery, and business information, but no proper
  online store.

- Payments: A Square card terminal for in-store payments. I'd prefer to keep Square and connect it
  to online payments if possible.

- Orders: Phone calls, handwritten notes, and a basic online form. I transfer orders into
  spreadsheets manually.

- Inventory: Excel spreadsheets and manual stock counts, which often become inaccurate during busy
  periods.

- Customer records: Basic spreadsheets containing contact information and previous purchases.

- Communication: Gmail for customer inquiries, confirmations, and event bookings.

My priority: I'd like the new website to centralize orders, inventory, and customer information
while keeping Square and Gmail. We should also transfer existing customer records and product
information without losing important details.

Ultimately, I want to eliminate duplicate data entry and give my staff one reliable place to manage
daily operations! 🌷

#### 39. Neil

What pages, product details, photos, and shop policies should appear on the site, and who will
provide and keep that information up to date?

#### 40. Lily

Hi Neil! 🌸 I'd love a beautiful, welcoming website that reflects the personality of Lily's Florist
and is easy for my team to maintain!

- Essential pages: Home, Shop, Gallery, About Us, Contact, Delivery & FAQs, and Order Tracking. I'd
  add a Blog and Customer Accounts in Version 2.

- Product details: Each arrangement should show its name, description, price, size options, flower
  types, availability, care instructions, and delivery options.

- Photos: I'll provide high-quality pictures of our bouquets, seasonal arrangements, wedding
  flowers, shop interior, and behind-the-scenes work.

- Shop policies: Delivery areas and fees, pickup arrangements, cancellation deadlines, refunds,
  substitutions, privacy, and payment security.

- Content management: I'll manage prices, promotions, policies, and blog content. My florists should
  be able to update product photos, descriptions, and flower availability.

- Updates: Inventory should update automatically as orders are processed. We'll review product
  listings weekly and refresh seasonal content before major holidays.

My priority: I want my staff and me to make everyday website updates ourselves without needing a
developer, while keeping all product information accurate and attractive! 🌷

#### 41. Neil

What needs should we accommodate for customers using phones, assistive technology, or languages
other than English?

#### 42. Lily

Hi Neil! 🌸 I want Lily's Florist to be welcoming and easy to use for everyone, regardless of their
device, abilities, or preferred language.

- Mobile-friendly design: Customers should easily browse flowers, place orders, and make payments
  using smartphones or tablets.

- Accessibility: Large, readable text, good color contrast, clear buttons, and simple navigation for
  customers with visual or physical difficulties.

- Assistive technology: The website should support screen readers, keyboard navigation, descriptive
  image text, and accessible checkout forms.

- Language options: English should be the default, with Spanish available at launch. I'd like to add
  more languages as customer demand grows.

- AI customer support: Our AI assistant should understand English and Spanish and provide helpful
  responses in either language.

- Easy checkout: Clear instructions, understandable error messages, and minimal unnecessary steps,
  especially for older customers.

My priority: Customers should be able to complete an order independently and confidently. I'd also
like important information, including prices, delivery policies, and payment instructions, to be
equally clear in both languages! 🌷

#### 43. Neil

Which customer questions or tasks should the AI assistant handle around the clock? Could you give an
example of a conversation that ends successfully?

#### 44. Lily

Hi Neil! 🌸 I'd love an AI assistant that provides friendly, helpful customer service 24/7, even when
my shop is closed!

**The AI assistant should handle:**

- General questions: Opening hours, shop location, delivery areas, fees, and policies.

- Flower recommendations: Suggest arrangements based on occasion, budget, colors, and preferences.

- Product availability: Check current flower stock, prices, and seasonal specials.

- Order assistance: Help customers place orders, track deliveries, and understand pickup options.

- Flower care: Explain how to keep arrangements fresh and beautiful.

- Language support: Assist customers in English and Spanish.

**Example of a successful conversation:**

- Customer: I need birthday flowers delivered tomorrow for under $60.

- AI: I'd recommend our $55 seasonal mixed bouquet! Would you like to check delivery availability?

- Customer: Yes, tomorrow afternoon.

- AI: Afternoon delivery is available for your address. The delivery fee is $8, bringing the total
  to $63 before tax. Shall I show you the checkout page?

- Customer: Yes, please!

- AI: Here's your bouquet ready for checkout. You can add a birthday message and complete your
  payment securely.

My priority: I'd like AI to resolve at least 70% of routine questions, but always offer human
assistance for complaints, refunds, unusual requests, or anything it cannot confidently answer. 🌷

#### 45. Neil

What information should the AI use for its answers, who will keep it current, and does it need
access to live inventory or order information?

#### 46. Lily

Hi Neil! 🌸 I'd like our AI assistant to provide accurate, up-to-date information that customers can
trust.

- Information sources: Our product catalog, prices, flower care guides, opening hours, delivery
  policies, FAQs, and seasonal promotions.

- Live inventory: Yes! The AI should check current flower availability before recommending
  arrangements, especially during busy holidays.

- Order information: Customers should be able to check their order status after securely verifying
  their identity. The AI must never reveal another customer's details.

- Who maintains it: I'll manage prices, policies, promotions, and FAQs, while my florists update
  flower availability and product information.

- Automatic updates: Inventory and order statuses should update whenever staff process orders,
  receive stock, or complete deliveries.

- Accuracy and safety: If information is missing or uncertain, the AI should explain this and refer
  the customer to my staff rather than guess.

My priority: I want the AI to use the same reliable information my staff see, without independently
changing orders, issuing refunds, or promising unavailable flowers! 🌷

#### 47. Neil

If the AI cannot answer, gives an incorrect answer, or a customer requests a person, how should it
respond and arrange follow-up, especially outside business hours?

#### 48. Lily

Hi Neil! 🌸 I want customers to feel supported, even when our AI assistant cannot resolve their
concerns.

- Unable to answer: The AI should politely explain its limitations and offer to connect the customer
  with a staff member.

- Incorrect answers: It should apologize, correct the information using verified shop details, and
  alert staff if the mistake affected an order.

- Human assistance: Customers should always have the option to request a person, without repeatedly
  explaining their problem.

- During business hours: Staff should receive an immediate notification and take over the
  conversation when available.

- Outside business hours: The AI should collect the customer's name, contact details, issue, and
  order number if relevant, then create a follow-up request for the next business day.

- Urgent problems: Delivery failures, incorrect orders, and payment issues should receive priority
  attention.

My priority: Customers should receive a reference number and confirmation of their request, with a
clear expectation of when staff will respond. I'd like staff to see the conversation history so
customers don't have to repeat themselves. 🌷

#### 49. Neil

What customer information may the AI access or collect, how should it verify someone before
discussing an order, and which actions must require staff approval?

#### 50. Lily

Hi Neil! 🌸 Protecting my customers' personal information is extremely important to me!

- Information collected: The AI may ask for names, email addresses, phone numbers, delivery
  preferences, and order numbers when needed.

- Information accessed: It should only access relevant product details, order statuses, and delivery
  information necessary to answer a customer's question.

- Identity verification: Before discussing a specific order, customers should sign into their
  account or verify themselves using a one-time code sent to the email or phone number associated
  with the order.

- Privacy: The AI must never reveal payment card details, passwords, or another customer's
  information. It should only collect essential details and avoid retaining unnecessary personal
  information.

- Staff approval required: Refunds, cancellations, significant order changes, flower substitutions,
  price adjustments, and changes to delivery addresses after dispatch.

- Customer consent: The AI should clearly explain when information is collected and when a
  conversation is passed to staff.

My priority: The AI should help customers confidently without compromising their privacy. I'd also
like staff to review AI conversations when resolving problems, with access restricted to authorized
employees. 🌷

#### 51. Neil

What launch date, budget, and operational constraints should guide the project, including expected
normal and peak order volumes?

#### 52. Lily

Hi Neil! 🌸 I'd love to have our new website ready well before Valentine's Day, our busiest season!

- Launch date: Ideally, January 15, 2027, allowing time for testing and staff training before
  Valentine's Day.

- Budget: I'm comfortable investing $12,000–$18,000 initially, with approximately $300–$500 monthly
  for hosting, maintenance, and AI services.

- Normal order volume: We currently receive 20–30 orders daily, but I'd like to grow to 40–50 daily
  orders.

- Peak order volume: Valentine's Day, Mother's Day, and major holidays can bring 100+ orders daily.
  The website should comfortably support 150–200 orders per day.

- Operational constraints: We're a small team, so the system must be simple to use, minimize manual
  tasks, and integrate with Square and Gmail.

- Other requirements: Existing customer records must be preserved, staff need training, and the
  website must work reliably on mobile devices.

My priority: I'd rather launch a reliable website with essential features on time than rush advanced
features. We cannot afford major disruptions to orders or deliveries during our busiest holidays! 🌷

## Appendix B: Project Checklist

### Summary

Complete the project individually, starting with the Lily interview. Follow the steps in order,
checking each off when its stated result exists.

The checklist targets the rubric's highest-score criteria while keeping the work simple. It covers
planning and design; building a working website is not required.

Source: [School project rubric](rubric.pdf).

### 1. Interview Lily

- [x] **Prepare interview questions.** Cover current frustrations, business goals, customers,
      ordering, inventory, and round-the-clock AI support.
- [x] **Open the school-provided Lily chat.** Introduce yourself and explain what you want to learn.
- [x] **Understand the current process.** Ask how orders, inventory, and customer support work today
      and where problems occur.
- [x] **Clarify the desired website.** Ask what customers and staff should accomplish and which
      outcomes matter most.
- [x] **Clarify AI support.** Ask what it should handle, what information it needs, and when human
      help is necessary.
- [x] **Explore problems and exceptions.** Discuss a successful order, then situations such as
      unavailable products, failed checkout, or unanswered support questions.
- [x] **Confirm your understanding.** Summarize Lily's needs back to her and resolve gaps or
      contradictions.
- [x] **Save the evidence.** Keep the transcript and create the share link required for submission.

### 2. Write the user stories

- [x] **Summarize the interview.** Record confirmed needs, user types, and any remaining assumptions
      separately.
- [x] **Write 15 distinct user stories.** Use: "As a [role], I want [need], so that [outcome]."
- [x] **Check story coverage.** Include multiple user types and AI-enabled customer support; ensure
      ordering and inventory needs from the interview are represented.
- [x] **Number and verify the stories.** Label them `US-01` through `US-15` and record the
      supporting interview answer for each. Ask Lily follow-up questions if needed.

### 3. Map one user journey

- [x] **Choose one goal from the stories.** Select a concrete task that will also work well as a
      wireframe sequence.
- [x] **Define the persona and scenario.** State who the user is, what prompted the task, and what
      success means. List the related story IDs.
- [x] **Map the successful path.** For each step, record the user's action, the system's response,
      and the next step.
- [x] **Add relevant alternate paths.** Show likely problems, dead ends, and how the user recovers
      or gets help.

### 4. Define the requirements

- [x] **Draft at least 20 requirements from the stories.** Include website functionality and
      AI-enabled customer support.
- [x] **Number and categorize them.** Use `FR-01...` for functional requirements and `NFR-01...` for
      nonfunctional requirements. Include both categories.
- [x] **Make each requirement verifiable.** Replace vague wording with observable behavior or
      measurable constraints. Confirm important unspecified targets with Lily rather than inventing
      them.
- [x] **Connect requirements to stories.** Put the supporting story IDs beside every requirement.
- [x] **Review the complete set.** Check for ambiguity, contradictions, duplicates, and missing
      customer needs.

### 5. Create the Figma wireframes

- [ ] **List the screens and states needed for the journey.** Include the main path and relevant
      problem or recovery states.
- [ ] **Draw rough wireframes in Figma.** Use simple boxes, labels, and controls; prioritize a clear
      flow.
- [ ] **Annotate the wireframes.** Explain design choices, what happens when controls are used, and
      which requirement IDs the elements address.
- [ ] **Walk through the journey using the wireframes.** Fix missing steps, confusing interactions,
      and inconsistencies with the requirements.

### 6. Assemble and submit

- [ ] **Assemble one document.** Include the interview share link, user stories, user journey,
      requirements, and readable wireframe images with annotations.
- [ ] **Check it against the rubric.** Verify the counts, multiple user perspectives, AI support
      coverage, both requirement categories, and traceability.
- [ ] **Export and inspect one PDF of at least four pages.** Check spelling, layout, image
      legibility, and that the interview link is accessible.
- [ ] **Submit through the school dashboard.** Retain a copy of the submitted PDF.

### Defaults

Use exactly 15 stories initially and at least 20 requirements; add more only when needed to
represent Lily's needs. Choose the journey and screen count after the interview.

Keep this checklist in the project directory as `project_checklist.md`. No agent-instruction
updates are included.
