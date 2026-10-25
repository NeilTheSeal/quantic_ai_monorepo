# Managing AI Engineering project checklist

## Summary

Complete the project individually, starting with the Lily interview. Follow the steps in order,
checking each off when its stated result exists.

The checklist targets the rubric's highest-score criteria while keeping the work simple. It covers
planning and design; building a working website is not required.

Source: [School project rubric](rubric.pdf).

## 1. Interview Lily

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

## 2. Write the user stories

- [ ] **Summarize the interview.** Record confirmed needs, user types, and any remaining assumptions
      separately.
- [ ] **Write 15 distinct user stories.** Use: "As a [role], I want [need], so that [outcome]."
- [ ] **Check story coverage.** Include multiple user types and AI-enabled customer support; ensure
      ordering and inventory needs from the interview are represented.
- [ ] **Number and verify the stories.** Label them `US-01` through `US-15` and record the
      supporting interview answer for each. Ask Lily follow-up questions if needed.

## 3. Map one user journey

- [ ] **Choose one goal from the stories.** Select a concrete task that will also work well as a
      wireframe sequence.
- [ ] **Define the persona and scenario.** State who the user is, what prompted the task, and what
      success means. List the related story IDs.
- [ ] **Map the successful path.** For each step, record the user's action, the system's response,
      and the next step.
- [ ] **Add relevant alternate paths.** Show likely problems, dead ends, and how the user recovers
      or gets help.

## 4. Define the requirements

- [ ] **Draft at least 20 requirements from the stories.** Include website functionality and
      AI-enabled customer support.
- [ ] **Number and categorize them.** Use `FR-01...` for functional requirements and `NFR-01...` for
      nonfunctional requirements. Include both categories.
- [ ] **Make each requirement verifiable.** Replace vague wording with observable behavior or
      measurable constraints. Confirm important unspecified targets with Lily rather than inventing
      them.
- [ ] **Connect requirements to stories.** Put the supporting story IDs beside every requirement.
- [ ] **Review the complete set.** Check for ambiguity, contradictions, duplicates, and missing
      customer needs.

## 5. Create the Figma wireframes

- [ ] **List the screens and states needed for the journey.** Include the main path and relevant
      problem or recovery states.
- [ ] **Draw rough wireframes in Figma.** Use simple boxes, labels, and controls; prioritize a clear
      flow.
- [ ] **Annotate the wireframes.** Explain design choices, what happens when controls are used, and
      which requirement IDs the elements address.
- [ ] **Walk through the journey using the wireframes.** Fix missing steps, confusing interactions,
      and inconsistencies with the requirements.

## 6. Assemble and submit

- [ ] **Assemble one document.** Include the interview share link, user stories, user journey,
      requirements, and readable wireframe images with annotations.
- [ ] **Check it against the rubric.** Verify the counts, multiple user perspectives, AI support
      coverage, both requirement categories, and traceability.
- [ ] **Export and inspect one PDF of at least four pages.** Check spelling, layout, image
      legibility, and that the interview link is accessible.
- [ ] **Submit through the school dashboard.** Retain a copy of the submitted PDF.

## Defaults

Use exactly 15 stories initially and at least 20 requirements; add more only when needed to
represent Lily's needs. Choose the journey and screen count after the interview.

Keep this checklist in the project directory as `project_checklist.md`. No agent-instruction
updates are included.
