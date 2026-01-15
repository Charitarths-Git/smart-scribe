from manim import *

class ExpressingGratitude(Scene):
    """
    An animation visualizing the concept of gratitude as an act that connects people
    and creates a positive ripple effect.
    """
    def construct(self):
        # Branding
        branding = Text("Manim Expert Animation", font_size=18, color=GRAY).to_corner(DR, buff=0.3)
        self.add(branding)

        # Title Screen
        title = Text("Expressing Gratitude", font_size=60)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))
        self.wait(0.5)

        # Step 1: Scene Setup - The Giver and Receiver
        giver_label = Text("Giver", font_size=24).shift(LEFT * 3 + UP * 1.5)
        receiver_label = Text("Receiver", font_size=24).shift(RIGHT * 3 + UP * 1.5)
        
        giver = Circle(color=BLUE, fill_opacity=0.5).shift(LEFT * 3)
        receiver = Circle(color=PURPLE, fill_opacity=0.5).shift(RIGHT * 3)
        
        self.play(
            Write(giver_label),
            Write(receiver_label),
            Create(giver),
            Create(receiver),
            run_time=1.5
        )
        self.wait(0.5)

        # Step 2: The Act of Kindness
        kindness_label = Text("An act of kindness", font_size=24).next_to(giver, DOWN, buff=1)
        self.play(Write(kindness_label))
        kindness_dot = Dot(giver.get_center(), color=YELLOW, radius=0.15)
        self.play(FadeIn(kindness_dot, scale=0.5), run_time=0.5)
        self.play(kindness_dot.animate.move_to(receiver.get_center()), run_time=1.5, rate_func=smooth)
        self.play(FadeOut(kindness_dot), FadeOut(kindness_label), run_time=0.5)
        self.wait(0.5)

        # Step 3: Gratitude is Felt
        gratitude_shape = Triangle(color=GREEN, fill_opacity=0.7).scale(0.6).move_to(receiver.get_center())
        gratitude_felt_label = Text("Gratitude is felt", font_size=24).next_to(receiver, DOWN, buff=1)
        self.play(Write(gratitude_felt_label))
        self.play(GrowFromCenter(gratitude_shape), run_time=1)
        self.wait(0.5)
        self.play(FadeOut(gratitude_felt_label))

        # Step 4: Gratitude is Expressed
        gratitude_expressed_label = Text("Gratitude is expressed", font_size=24).next_to(receiver, DOWN, buff=1)
        gratitude_label = Text("Gratitude", font_size=24).next_to(gratitude_shape, UP, buff=0.1)
        gratitude_expression = VGroup(gratitude_shape, gratitude_label)
        
        self.play(Write(gratitude_expressed_label))
        self.play(Write(gratitude_label), run_time=1)
        self.play(gratitude_expression.animate.move_to(giver.get_center()), run_time=1.5, rate_func=smooth)
        self.play(FadeOut(gratitude_expressed_label))
        self.wait(0.5)

        # Step 5: The Connection is Formed
        connection = Line(giver.get_center(), receiver.get_center(), color=PINK, stroke_width=6)
        connection_label = Text("A connection is formed", font_size=24).move_to(connection.get_center() + DOWN*1.5)
        self.play(Write(connection_label))
        self.play(
            Transform(gratitude_expression, connection),
            giver.animate.set_color(WHITE),
            receiver.animate.set_color(WHITE),
            run_time=1
        )
        self.play(
            giver.animate.set_color(BLUE),
            receiver.animate.set_color(PURPLE),
            run_time=0.5
        )
        self.wait(0.5)
        self.play(FadeOut(connection_label))

        # Step 6: The Ripple Effect
        ripple_label = Text("Creating a ripple effect", font_size=24).next_to(connection, DOWN, buff=1)
        self.play(Write(ripple_label))
        
        ripples = VGroup()
        ripple_colors = [ORANGE, YELLOW, TEAL]
        for i in range(3):
            ripple = Dot(connection.get_center(), color=ripple_colors[i], radius=0.1)
            ripples.add(ripple)
        
        self.play(FadeIn(ripples, scale=0.5))
        self.play(
            ripples[0].animate.shift(UP * 2 + RIGHT * 1),
            ripples[1].animate.shift(DOWN * 1.5 + RIGHT * 0.5),
            ripples[2].animate.shift(UP * 0.5 + LEFT * 2),
            run_time=2,
            rate_func=rush_from
        )
        self.play(FadeOut(ripples), FadeOut(ripple_label), run_time=0.5)
        self.wait(0.5)

        # Step 7: Final Message
        final_text = Text("Gratitude Connects Us", font_size=48).to_edge(DOWN)
        self.play(Write(final_text), run_time=2)

        # Step 8: Fade Out
        self.wait(3)
        # Note: gratitude_expression was transformed into connection, so we fade out connection.
        self.play(
            FadeOut(giver, receiver, giver_label, receiver_label, connection, final_text, branding),
            run_time=1.5
        )
        self.wait(1)