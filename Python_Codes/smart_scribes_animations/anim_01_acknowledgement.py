from manim import *

class AcknowledgementAnimation(Scene):
    """
    An animation visualizing the positive impact of acknowledging contributions.
    It follows a narrative: a new contribution is made, an observer acknowledges it,
    this validation strengthens the whole structure, and a positive feedback
    loop is created.
    """
    def construct(self):
        # Set a background color for better contrast and visual appeal
        self.camera.background_color = "#222222"

        # --- Step 1: The Unseen Contribution ---
        # A structure of adjacent squares with a central gap, representing an existing project or team.
        main_structure = VGroup(
            Square(color=WHITE),
            Square(color=WHITE),
            Square(color=WHITE),
            Square(color=WHITE)
        ).arrange(RIGHT, buff=0.0).move_to(UP * 1.5)
        # Create a gap in the middle by shifting squares
        main_structure[0:2].shift(LEFT * 1.1)
        main_structure[2:4].shift(RIGHT * 1.1)
        
        self.play(Create(main_structure), run_time=2)
        self.wait(0.5)

        # A new contribution is introduced, initially separate and unnoticed.
        contribution = Triangle(color=PURPLE, fill_opacity=0.7).scale(0.8).move_to(DOWN * 2)
        
        self.play(FadeIn(contribution, scale=0.5), run_time=1)

        # The new contribution moves to fill the gap, becoming part of the whole.
        gap_position = main_structure.get_center()
        self.play(contribution.animate.move_to(gap_position), run_time=1.5)
        self.wait(1)

        # --- Step 2: The Act of Acknowledging ---
        # An observer is introduced, representing a team member, manager, or the community.
        observer = Circle(color=BLUE, radius=0.6, fill_opacity=1).move_to(LEFT * 5)
        
        self.play(FadeIn(observer), run_time=1)

        # A "line of sight" arrow shows the observer noticing and acknowledging the contribution.
        acknowledgement_arrow = Arrow(
            start=observer.get_right(), 
            end=contribution.get_left(), 
            color=YELLOW, 
            buff=0.2,
            stroke_width=6,
            max_tip_length_to_length_ratio=0.2
        )
        
        self.play(GrowArrow(acknowledgement_arrow), run_time=1.5)
        self.wait(1)

        # --- Step 3: The Impact of Validation ---
        # The contribution pulses with color and size, showing it has been validated and valued.
        self.play(
            contribution.animate.set_color(GREEN).set_fill(opacity=1).scale(1.2), 
            run_time=1
        )
        self.play(contribution.animate.scale(1/1.2), run_time=0.5) # Settle back to normal size

        # The validation strengthens the entire structure, symbolized by a unified color change.
        self.play(main_structure.animate.set_color(GREEN), run_time=1.5)
        self.wait(1)

        # --- Step 4: The Positive Feedback Loop ---
        # The one-way arrow transforms into a solid, two-way connection, symbolizing a new relationship.
        connection_line = Line(
            acknowledgement_arrow.get_start(), 
            acknowledgement_arrow.get_end(), 
            color=PINK, 
            stroke_width=8
        )
        
        self.play(Transform(acknowledgement_arrow, connection_line), run_time=1)

        # This positive interaction inspires a new idea, born from the observer.
        new_idea = Dot(
            point=observer.get_center() + RIGHT * 0.5 + DOWN * 0.8, 
            color=ORANGE, 
            radius=0.15
        )
        
        self.play(FadeIn(new_idea, scale=2), run_time=1)
        self.wait(2)

        # --- Step 5: Final Title ---
        # Fade out all elements to bring focus to the final message.
        self.play(FadeOut(*self.mobjects), run_time=1.5)

        # Display the central theme of the animation.
        title = Text("Acknowledgement", font_size=72, color=YELLOW)
        
        self.play(Write(title), run_time=2.5)
        self.wait(3)