from manim import *
import numpy as np

class GratitudeRippleEffect(Scene):
    """
    An animation depicting the spread of gratitude as a ripple effect,
    starting from a single act of kindness and growing into a connected network.
    """
    def construct(self):
        # Configuration
        self.camera.background_color = BLACK

        # Branding
        branding = Text("Manim Expert", font_size=18, color=GRAY).to_corner(DR, buff=0.3)
        self.add(branding)

        # Title Screen
        title_text = Text("Gratitude", font_size=72)
        self.play(Write(title_text), run_time=1.5)
        self.wait(1.5)
        self.play(FadeOut(title_text), run_time=1)

        # This list will store the location and color of each "gift" for the final scene
        spark_data = []

        # SCENE 1: The Spark of Kindness
        # A single act of kindness is represented by a gift transfer.
        dot_A = Dot(LEFT * 3, color=BLUE)
        dot_B = Dot(RIGHT * 3, color=WHITE)
        self.play(FadeIn(dot_A), FadeIn(dot_B), run_time=1)

        gift = Circle(radius=0.2, color=GREEN, fill_opacity=0.8).move_to(dot_A.get_center())
        self.play(Create(gift), run_time=0.5)
        self.play(gift.animate.move_to(dot_B.get_center()), run_time=2)

        connection1 = Line(dot_A, dot_B, color=WHITE, stroke_width=2)
        self.play(
            dot_B.animate.set_color(BLUE),
            FadeOut(gift),
            Create(connection1),
            run_time=1.5
        )
        spark_data.append({"pos": dot_B.get_center(), "color": GREEN})

        # Group mobjects for easier management
        all_dots = VGroup(dot_A, dot_B)
        all_connections = VGroup(connection1)

        # SCENE 2: The Inner Growth
        # The feeling of gratitude appears and grows within the recipient.
        inner_glow = Circle(radius=0.4, color=GREEN, fill_opacity=0.5).move_to(dot_B.get_center())
        self.play(Transform(Dot(dot_B.get_center(), radius=0.01), inner_glow), run_time=1)
        self.play(inner_glow.animate.scale(0.8), run_time=1.5, rate_func=there_and_back)

        gratitude_text = Text("Gratitude", color=WHITE, font_size=60).next_to(inner_glow, UP, buff=1.5)
        self.play(Write(gratitude_text), run_time=1.5)

        # SCENE 3: The Ripple Spreads
        # The recipient is inspired to pass on an act of kindness.
        self.play(FadeOut(inner_glow), FadeOut(gratitude_text), run_time=1)

        dot_C = Dot(RIGHT * 4 + UP * 2, color=WHITE)
        self.play(FadeIn(dot_C), run_time=0.5)

        gift2 = Square(side_length=0.4, color=YELLOW, fill_opacity=0.8).move_to(dot_B.get_center())
        self.play(Create(gift2), run_time=0.5)
        self.play(gift2.animate.move_to(dot_C.get_center()), run_time=2)

        connection2 = Line(dot_B, dot_C, color=WHITE, stroke_width=2)
        self.play(
            dot_C.animate.set_color(BLUE),
            FadeOut(gift2),
            Create(connection2),
            run_time=2
        )
        spark_data.append({"pos": dot_C.get_center(), "color": YELLOW})
        
        all_dots.add(dot_C)
        all_connections.add(connection2)

        # SCENE 4: The Network Cascade
        # The effect multiplies, creating a network of interconnected acts.
        new_dot_positions = [
            np.array([-4, 2, 0]), np.array([-5, -1, 0]), np.array([-2, -2.5, 0]),
            np.array([0, -3, 0]), np.array([2, -2.5, 0]), np.array([5, -1, 0]),
            np.array([2, 2.5, 0]), np.array([-1, 3, 0]),
        ]
        new_dots = VGroup(*[Dot(pos, color=WHITE) for pos in new_dot_positions])
        self.play(FadeIn(new_dots), run_time=1)

        source_dots = VGroup(dot_A, dot_B, dot_C)
        gift_shapes = [Triangle, Circle, Square]
        gift_colors = [ORANGE, PURPLE, RED, ORANGE, PURPLE, RED, ORANGE, PURPLE]
        
        gifts_to_create = VGroup()
        move_animations = []
        transform_animations = []
        new_connections = VGroup()
        
        for i, target_dot in enumerate(new_dots):
            source_dot = source_dots[i % len(source_dots)]
            ShapeClass = gift_shapes[i % len(gift_shapes)]
            color = gift_colors[i % len(gift_colors)]
            
            gift = ShapeClass(color=color, fill_opacity=0.8).scale(0.2).move_to(source_dot.get_center())
            gifts_to_create.add(gift)
            
            move_animations.append(gift.animate.move_to(target_dot.get_center()))
            transform_animations.append(target_dot.animate.set_color(BLUE))
            
            connection = Line(source_dot, target_dot, color=WHITE, stroke_width=2)
            new_connections.add(connection)
            
            spark_data.append({"pos": target_dot.get_center(), "color": color})

        # Execute the cascade animation in stages
        self.play(LaggedStart(*[Create(g) for g in gifts_to_create], lag_ratio=0.1), run_time=0.5)
        self.play(LaggedStart(*move_animations, lag_ratio=0.1), run_time=1.0)
        self.play(
            LaggedStart(*transform_animations, lag_ratio=0.1),
            Create(new_connections),
            FadeOut(gifts_to_create),
            run_time=0.5
        )
        all_dots.add(*new_dots)
        all_connections.add(new_connections)

        # SCENE 5: Unification
        # The individual acts of kindness coalesce into a powerful, unified whole.
        self.play(FadeOut(all_dots), FadeOut(all_connections), run_time=1)

        sparks = VGroup(*[Dot(d["pos"], color=d["color"]) for d in spark_data])
        self.play(LaggedStart(*[FadeIn(s, scale=2) for s in sparks], lag_ratio=0.1), run_time=0.5)
        self.play(LaggedStart(*[spark.animate.move_to(ORIGIN) for spark in sparks], lag_ratio=0.05), run_time=1.5)

        core_circle = Circle(radius=1.5, color=PINK, fill_opacity=1.0)
        self.play(Transform(sparks, core_circle), run_time=1)

        # SCENE 6: The Final Message
        # The animation concludes with a message about the connecting power of gratitude.
        self.play(sparks.animate.scale(1.1), run_time=0.5, rate_func=there_and_back)
        self.play(sparks.animate.scale(0.7).to_edge(UP), run_time=1)

        final_text = Text("Gratitude Connects Us", font_size=54)
        final_text.next_to(sparks, DOWN, buff=0.7)
        self.play(Write(final_text), run_time=2)

        self.wait(2)