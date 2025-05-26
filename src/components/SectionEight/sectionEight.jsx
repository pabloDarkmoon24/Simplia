import React from "react";
import '../SectionEight/sectionEight.css'
import usuario1 from '../../assets/usuario.png'

const testimonios = [
    {
    nombre: "Laura G.",
    comentario: "Gracias a Simplia, ahora tengo todas mis plataformas favoritas por un solo precio. ¡me encanta!",
    foto: usuario1,
  },
  {
    nombre: "Carlos C.",
    comentario: "El servicio es excelente, y el ahorro es real. ¡Totalmente recomendado!",
    foto: usuario1,
  },
  {
    nombre: "Diana R.",
    comentario: "Nunca pensé que fuera tan fácil. me ayudaron en todo y funciona perfecto.",
    foto: usuario1,
  },
]

export const SectionEight = () => {
    return (
        <section className="section-eigth">
            <h2 className="testimonials-title">
               Estamos orgullosos de lo que nuestros <br />
                miembros tienen para decir: 
            </h2>

            <div className="testimonials-grid">
                {testimonios.map((t,i)=>(
                    <div className="testimonial-card" key={i}>
                        <img src={t.foto} alt={t.nombre} className="testimonial-avatar" />
                        <h3>{t.nombre}</h3>
                        <p>{t.comentario}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}