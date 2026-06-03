## Plan

1. **Move the pulse off the icon-only style path**
   - Wrap the guide button in a `relative` container and render a dedicated green pulse ring behind/around it for 3 seconds.
   - This avoids conflicts with the icon color, tooltip trigger styling, runtime spinner animations, or inherited transition classes.

2. **Make the animation unambiguous**
   - Use a unique keyframe name such as `metame-guide-arrival-pulse` so it cannot collide with existing `pulse`, thinking dots, or spinner animations.
   - Animate opacity/scale on the ring pseudo-layer instead of relying only on `box-shadow` on the button.

3. **Trigger it reliably on arrival**
   - Keep the current per-page-load behavior, but delay the pulse start slightly after mount so it runs after header/runtime takeover animations settle.
   - Keep the duration at exactly 3 seconds.

4. **Verify the output**
   - Confirm the guide button still opens the welcome tour.
   - Confirm the green ring is visible on page arrival and stops after 3 seconds.