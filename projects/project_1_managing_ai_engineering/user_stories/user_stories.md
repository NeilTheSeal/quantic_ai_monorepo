# User Stories

## Project Epic

### We want to create a simple online flower-ordering experience for Lily's Florist Shop, where customers can easily browse inventory, save their selection, pay for their order, track previous orders, and receive AI assistance when needed in a responsive web interface. Lily's Florist Shop employees should be able to track orders and inventory, schedule deliveries, and access workflows and shop tools to support their roles

## Project Features and User Stories

**Note from the author**: this is how we write features and user stories at my job and how I learned to write them in school. Any discrepancies between how these are written and Quantic's convention I see merely as a matter of taste and company culture

### As a Lily's Florist Customer, I want to be able to browse the shop's inventory with integrated search functionality

- Given I am a Lily's Florist Customer, when I visit the website, then there is a tab at the top of the site (e.g. "Shop") where I can click to navigate to the shop's inventory

- Given I am a Lily's Florist Customer, when I hover over the "Shop" tab at the top of the site, then I see a drop-down menu with categories of the available inventory including individual flowers, arrangements (identical), arrangements (mixed), clearance, seasonal, flower health supplements, containers and vases, and accessory items

- Given I am a Lily's Florist Customer, when I click on any one of the inventory category items in the dropdown sub-menu, then I can see the full list of items in that category including flowers that are out-of-stock or on sale

- Given I am a Lily's Florist Customer, when I am browsing in an inventory category, then I can sort and filter by price, season, color(s), holiday, and "in-stock"

### As a Lily's Florist Customer, I want to be able to purchase items from the online shop using a friendly user interface and secure payment

- Given I am a Lily's Florist Customer, when I want to add an item to my shopping cart, then there is a plus (+) icon I can click next to each item to save it to my shopping cart

- Given I am a Lily's Florist Customer, when I have added an item to my shopping cart, then there is a sidebar containing the items I have added to my cart

- Given I am a Lily's Florist Customer, when I want to check out, then I can click a "check out" button on the shopping cart side bar to be brought to the checkout page

- Given I am a Lily's Florist Customer, when I am brought to the checkout page, then I can modify my order by changing quantities of items or removing items from my shopping cart

- Given I am a Lily's Florist Customer, when I click "confirm" on the checkout page, then I am prompted for payment using a variety of available methods such as cash (for pickup), credit card, cryptocurrency, Stripe, Klarna, PayPal, and Venmo.

- Given I am a Lily's Florist Customer, when I have finished my payment, then I am provided an invoice and receipt with an order number and am sent the same information via email

### As a Lily's Florist Customer, I want to have AI assistance when using the website

- Given I am a Lily's Florist Customer, when I am using the website, then there is an icon in the bottom-right corner of the web interface where I can click to chat with an AI agent

- Given I am a Lily's Florist AI Agent, when I am chatting with a customer, then I am able to provide context about every publicly available bit of information on the website, as well as background information such as store history, hours, location, and contact info

- Given I am a Lily's Florist AI Agent, when I am chatting with a customer, then I have enough information about their shopping experience (session browsing history on our site, shopping cart contents) to provide helpful information to them specifically

- Given I am a Lily's Florist AI Agent, when I am chatting with a customer, then I do not have access to any personal identifying information about the customer such as credit card numbers, name and phone, email, and likewise none of this information is tracked without consent

### As a Lily's Florist Associate, I want to have assistive technology for my job

- Given I am a Lily's Florist Associate, when I log onto the web portal, then I am able to see the full shop inventory, including quantities of each item, cost of goods, MSRP, and current display price

- Given I am a Lily's Florist Associate, when I log onto the web portal, then I can see all of the pending orders, including invoice numbers, sale price, items and their quantities

- Given I am a Lily's Florist Administrator, when I log onto the web portal, then I can add and delete users to and from the portal, including other associates

- Given I am a Lily's Florist Administrator, when I log onto the web portal, then I can modify transactions, including giving refunds and modifying sale prices
