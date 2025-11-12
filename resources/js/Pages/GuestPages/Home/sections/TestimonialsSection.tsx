import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import './TestimonialsSection.css';

export default function TestimonialsSection() {
    const { ref, inView } = useInView({
        threshold: 0.2,
        triggerOnce: true,
    });

    const [currentSlide, setCurrentSlide] = useState(0);

    const testimonials = [
        {
            text: 'FamTree helped us connect with relatives we never knew existed. The platform is intuitive and the customer support is fantastic!',
            author: 'Sarah Johnson',
            role: 'Family Historian',
            image: '👩‍🦰',
        },
        {
            text: 'I love how easy it is to share our family history with extended relatives. Everyone can contribute their own stories and photos.',
            author: 'Michael Chen',
            role: 'Genealogy Enthusiast',
            image: '👨‍💼',
        },
        {
            text: 'The privacy controls give me peace of mind. I can share freely with family while keeping sensitive information secure.',
            author: 'Emma Williams',
            role: 'Family Archivist',
            image: '👩‍🎓',
        },
        {
            text: 'FamTree is how my entire family stays connected. From the youngest to the oldest generation, everyone loves it!',
            author: 'James Rodriguez',
            role: 'Grandfather of 12',
            image: '👴',
        },
    ];

    const goToSlide = (index: number) => {
        setCurrentSlide(index % testimonials.length);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className="testimonials-section" ref={ref}>
            <div className="testimonials-container">
                <div className={`testimonials-header ${inView ? 'in-view' : ''}`}>
                    <h2>What Families Say</h2>
                    <p>Hear from real users who are preserving their heritage</p>
                </div>

                <div className={`testimonials-slider ${inView ? 'in-view' : ''}`}>
                    <div className="testimonials-carousel">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className={`testimonial-slide ${
                                    index === currentSlide ? 'active' : ''
                                }`}
                            >
                                <blockquote className="testimonial-text">
                                    "{testimonial.text}"
                                </blockquote>

                                <div className="testimonial-author">
                                    <span className="author-image">{testimonial.image}</span>
                                    <div>
                                        <p className="author-name">{testimonial.author}</p>
                                        <p className="author-role">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="slider-button prev"
                        onClick={prevSlide}
                        aria-label="Previous testimonial"
                    >
                        ‹
                    </button>
                    <button
                        className="slider-button next"
                        onClick={nextSlide}
                        aria-label="Next testimonial"
                    >
                        ›
                    </button>

                    <div className="slider-indicators">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${
                                    index === currentSlide ? 'active' : ''
                                }`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to testimonial ${index + 1}`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
