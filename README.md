# QuickPrint // Web-to-Print Concept (MVP)

A modern, clean, mobile-first frontend concept designed to streamline the online print-ordering workflow for local print shops. 

This project bridges the gap between traditional local print shops and digital convenience by allowing customers to structure their print configurations (color, copies, paper size, binding, and file notes) and generate a standardized, pre-formatted order summary directly via email.

---

## 🌟 Key Features

* **Multi-File Configuration:** Add, configure, and manage multiple print files independently, each with its own specific layout rules.
* **Dynamic Print Settings:**
  * Print Type (Colour / Black & White)
  * Copies (Interactive counter or manual input)
  * Paper Sizes (A4, A3, A5, Other)
  * Orientation (Portrait / Landscape)
  * Printing Sides (Single-sided / Double-sided)
  * Binding Options (No Binding, Spiral, Comb, Staple, etc.)
  * Per-file specific instructions and notes.
* **Live Order Summary:** Real-time preview card on desktop view that dynamically reflects configuration updates as the user types or selects options.
* **Customer Pickup Scheduling:** Includes user contact details and a mandatory pickup time validator ensuring orders are scheduled at least 15 minutes ahead.
* **Pre-Flight Attachment Reminder Modal:** Prompts users with a checklist and confirmation gate to guarantee they manually attach their files in Gmail before sending.
* **Automated `mailto:` Integration:** Converts structured form data into a professionally formatted specification email body.
* **Zero Backend Required:** Fully functional static frontend built with vanilla web technologies.

---

## 🛠️ Tech Stack

* **HTML5:** Semantic, accessible layout structure.
* **CSS3:** Custom responsive styling utilizing CSS variables, Flexbox, and CSS Grid (Desktop split-screen & mobile-first design).
* **Vanilla JavaScript (ES6+):** Dynamic card rendering, live summary updates, input validations, and mailto link generation.

---

## 📂 Project Structure

```text
quickprint/
│
├── index.html       # Main application markup & modal structure
├── style.css        # Professional styling, theme variables, and responsive layout
└── script.js        # Form logic, dynamic file management, live preview, and mailto handler
