from manim import *

class ConcludingRemarks(Scene):
    """
    An animation summarizing key concepts, showing their synthesis into a core principle,
    and concluding with a thank you message.
    """
    def construct(self):
        # Set a black background for the scene
        self.camera.background_color = BLACK

        # --- Step 1: Title Introduction ---
        title_text = Text("In Summary", color=WHITE).scale(1.2).move_to(2 * UP)
        underline = Line(LEFT, RIGHT, color=BLUE_D).stretch_to_fit_width(title_text.width + 0.5)
        underline.next_to(title_text, DOWN, buff=0.2)

        self.play(Write(title_text, run_time=1.5))
        self.play(Create(underline, run_time=1.0))
        self.wait(1.0)

        # Fade out the title and underline together
        self.play(FadeOut(title_text, underline), run_time=0.5)

        # --- Step 2: Recap Key Points ---
        # Grouping concepts for easier management
        concept1 = VGroup(
            Square(color=BLUE_C),
            Text("Concept 1", color=WHITE, font_size=24)
        ).arrange(RIGHT).move_to(3 * LEFT + 1.5 * UP)

        concept2 = VGroup(
            Circle(color=GREEN_C),
            Text("Concept 2", color=WHITE, font_size=24)
        ).arrange(LEFT).move_to(3 * RIGHT + 1.5 * UP)
        
        concept3 = VGroup(
            Triangle(color=RED_C).scale(0.8),
            Text("Concept 3", color=WHITE, font_size=24)
        ).arrange(DOWN).move_to(2.5 * DOWN)

        # Animate the appearance of each concept
        self.play(FadeIn(concept1, shift=DOWN), run_time=1.0)
        self.wait(0.5)
        self.play(FadeIn(concept2, shift=DOWN), run_time=1.0)
        self.wait(0.5)
        self.play(FadeIn(concept3, shift=UP), run_time=1.0)
        self.wait(1.0)

        # --- Step 3: Synthesis ---
        # Create the central point of synthesis
        central_dot = Dot(color=YELLOW, radius=0.2).move_to(ORIGIN)
        self.play(FadeIn(central_dot, scale=2.0), run_time=1.0)

        # Separate shapes from text for individual animation
        shape1, text1 = concept1
        shape2, text2 = concept2
        shape3, text3 = concept3

        # Move shapes towards the center while fading out the text
        self.play(
            shape1.animate.move_to(LEFT * 2),
            shape2.animate.move_to(RIGHT * 2),
            shape3.animate.move_to(DOWN * 1.5),
            FadeOut(text1, text2, text3),
            run_time=1.5
        )

        # Create lines connecting the shapes to the central dot
        line1 = Line(shape1.get_center(), central_dot.get_center(), color=PURPLE_B, stroke_width=3)
        line2 = Line(shape2.get_center(), central_dot.get_center(), color=PURPLE_B, stroke_width=3)
        line3 = Line(shape3.get_center(), central_dot.get_center(), color=PURPLE_B, stroke_width=3)
        
        self.play(Create(VGroup(line1, line2, line3)), run_time=0.75)

        # Absorb the shapes and lines into the central dot
        synthesis_group = VGroup(shape1, shape2, shape3, line1, line2, line3)
        
        # CORRECTED: The original Transform logic would create a duplicate dot.
        # This approach uses ReplacementTransform to replace the group with a new dot
        # while fading the original, ensuring only one dot remains.
        target_dot = central_dot.copy()
        self.play(
            ReplacementTransform(synthesis_group, target_dot),
            FadeOut(central_dot),
            run_time=1.0
        )
        # Re-assign the variable to the new dot for the next step
        central_dot = target_dot

        # --- Step 4: The Key Takeaway ---
        # Transform the final dot into the core message
        takeaway_text = Text("Unity is the Core Principle", color=YELLOW).scale(0.8)
        self.play(Transform(central_dot, takeaway_text), run_time=1.5)

        self.wait(2.0)

        # Fade out the takeaway message
        # The 'central_dot' variable now points to the transformed text object.
        self.play(FadeOut(central_dot), run_time=0.5)

        # --- Step 5: Final Screen ---
        # Create a background element and the final text
        bg_circle = Circle(radius=2.5, color=ORANGE, fill_opacity=1.0, stroke_width=0)
        final_text = Text("Thank You", color=BLACK).scale(1.2)

        # Animate the final screen elements
        self.play(FadeIn(bg_circle, scale=0.2), run_time=1.0)
        self.play(Write(final_text), run_time=1.5)

        # Hold the final screen
        self.wait(2.0)