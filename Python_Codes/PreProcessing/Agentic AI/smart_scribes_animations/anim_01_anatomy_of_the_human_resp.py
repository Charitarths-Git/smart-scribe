from manim import *

class AnimationScene(Scene):
    def construct(self):
        # Branding
        branding = Text("Smart Scribes | iHub Hackathon", font_size=24).to_corner(DR)
        self.play(FadeIn(branding))

        # Title
        title_text = Text(
            "Anatomy of the Human Respiratory System",
            font_size=48,
            weight=BOLD
        ).to_edge(UP)
        
        subtitle_text = Text(
            "Thoracic Cage, Larynx, Trachea, Bronchial Tree",
            font_size=36,
            color=BLUE
        ).next_to(title_text, DOWN)

        self.play(
            Write(title_text),
            FadeIn(subtitle_text)
        )
        self.wait(2)
        self.play(
            FadeOut(title_text),
            FadeOut(subtitle_text)
        )

        # --- Visuals ---

        # 1. Thoracic Cage (represented abstractly as a large rectangle)
        thoracic_cage = Square(side_length=5).set_color(GRAY).scale_to_fit_width(6).scale_to_fit_height(7).move_to(ORIGIN)
        thoracic_label = Text("Thoracic Cage", font_size=30).next_to(thoracic_cage, UP, buff=0.5)
        
        self.play(FadeIn(thoracic_cage))
        self.play(Write(thoracic_label))
        self.wait(1)

        # 2. Larynx (Thyroid, Cricoid, Epiglottis)
        # Position above the center of the thoracic cage
        larynx_group = VGroup()

        # Epiglottis (Circle)
        epiglottis = Circle(radius=0.3, color=RED, fill_opacity=0.8).next_to(thoracic_cage.get_top(), UP, buff=0.5).shift(LEFT*0.5)
        epiglottis_label = Text("Epiglottis", font_size=24).next_to(epiglottis, LEFT, buff=0.2)
        epiglottis_arrow = Arrow(epiglottis_label.get_right(), epiglottis.get_left(), buff=0.1, max_stroke_width_to_length_ratio=0.05, max_tip_length_to_length_ratio=0.25)
        larynx_group.add(epiglottis, epiglottis_label, epiglottis_arrow)

        # Thyroid Cartilage (Square)
        thyroid = Square(side_length=0.7, color=GREEN, fill_opacity=0.8).next_to(epiglottis, DOWN, buff=0.2).shift(RIGHT*0.5)
        thyroid_label = Text("Thyroid Cartilage", font_size=24).next_to(thyroid, RIGHT, buff=0.2)
        thyroid_arrow = Arrow(thyroid_label.get_left(), thyroid.get_right(), buff=0.1, max_stroke_width_to_length_ratio=0.05, max_tip_length_to_length_ratio=0.25)
        larynx_group.add(thyroid, thyroid_label, thyroid_arrow)

        # Cricoid Cartilage (Circle)
        cricoid = Circle(radius=0.4, color=YELLOW, fill_opacity=0.8).next_to(thyroid, DOWN, buff=0.1)
        cricoid_label = Text("Cricoid Cartilage", font_size=24).next_to(cricoid, LEFT, buff=0.2)
        cricoid_arrow = Arrow(cricoid_label.get_right(), cricoid.get_left(), buff=0.1, max_stroke_width_to_length_ratio=0.05, max_tip_length_to_length_ratio=0.25)
        larynx_group.add(cricoid, cricoid_label, cricoid_arrow)

        self.play(FadeIn(larynx_group))
        self.wait(2)

        # 3. Trachea (tall, thin square)
        trachea = Square(side_length=1, color=ORANGE, fill_opacity=0.8).scale_to_fit_height(3).next_to(cricoid, DOWN, buff=0