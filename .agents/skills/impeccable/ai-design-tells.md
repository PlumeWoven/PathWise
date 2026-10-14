# The prompt that removes 15 AI design tells

Paste this into Claude Code, Cursor, Codex, Lovable, Bolt, or whatever you build with. It has your agent install Impeccable (free and open source) and run it, then fix the 15 tells.

```text
First, set up Impeccable, a free, open-source design skill for AI coding agents (github.com/pbakaus/impeccable, Apache 2.0). If you can run terminal commands:

1. From the project root, run: npx impeccable install --scope=project
   If it asks which tools to install for, pick the one you're running in.
2. Run /impeccable init so it records who the site is for and how it should feel. If the /impeccable command isn't available until I restart you, tell me and keep going with step 3.
3. Scan the site with Impeccable's detector (no API key needed): npx impeccable detect .
   If the site is live, also scan the URL: npx impeccable detect https://your-site.com

Then audit this site for AI design tells. Combine the detector's findings with the list below. List every instance with file and line, then fix them, then re-check and tell me anything you kept on purpose.

If you don't already know who the site is for and how it should feel, ask me before changing anything.

Remove or replace these 15:
1. Purple or indigo to blue gradients. Build a palette from the brand instead: one primary, one accent, real neutrals.
2. Inter, Geist or Roboto on everything. Pick a heading typeface with character. Keep body text simple and readable.
3. Gradient text. Use one solid color and get emphasis from size and weight.
4. Pill badges above the headline ("Introducing", "New"). Delete them, or put the useful info in the headline.
5. Glowing halos and soft spotlights behind sections. Use spacing and contrast to show what matters.
6. Glassmorphism: blur, glass cards, glow borders. Only keep it if it solves a real layering problem.
7. Icons in rounded squares above every heading. Put icons beside the heading or drop the container.
8. Grids of identical cards. Group related ideas and give the important ones more space.
9. Cards inside cards. Flatten it with spacing, type and dividers.
10. Thick colored stripes on the side of cards. Save them for real alerts or status.
11. Giant hero stats ("10M+ users") with no context. Only show a number if it explains the product.
12. Tiny numbered labels (01, 02, 03) when nothing is actually a sequence.
13. Pulsing dots, bouncy easing, hover zooms and auto-scrolling logo strips. Only animate when something actually changes.
14. Generic copy ("supercharge", "world-class", "Not a feature. A platform.") and em dashes. Say what the product does in plain words.
15. Defaulting to beige or cream with an oversized italic serif headline. Choose color and type for this specific product.

Also check: related things sit close together, sections have clear space between them, body text is 16px or larger, and text contrast is at least 4.5:1.

When you're done, run /impeccable polish if it's available, then run npx impeccable detect again and show me what's left.
```

No terminal (Lovable, Bolt, etc.)? The prompt still works: your builder skips the Impeccable steps and fixes the 15.

The 15 tells come from [Impeccable's slop catalog](https://impeccable.style/slop) by Paul Bakaus. Impeccable is free and open source: [github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable).

From [@deonnahodges](https://www.instagram.com/deonnahodges/)
