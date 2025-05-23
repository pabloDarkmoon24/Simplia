import React, {useState} from "react";
import '../SectionNine/sectionNine.css'
import btn from '../../assets/Boton-quiero-mi-membresia.png'


const questions = [
  {
    pregunta: "¿Qué plataformas incluye?",
    respuesta: "Aquí irá la descripción detallada de las plataformas incluidas.",
  },
  {
    pregunta: "Cómo recibo mis accesos",
    respuesta: "Aquí podrás explicar el proceso de entrega de accesos.",
  },
  {
    pregunta: "Puedo cancelar cuando quiera",
    respuesta: "Explica las condiciones de cancelación, si las hay.",
  },
  {
    pregunta: "Qué pasa si tengo dudas",
    respuesta: "Puedes añadir cómo funciona el soporte o contacto.",
  },
  {
    pregunta: "Cuáles son los regalos o descuentos",
    respuesta: "Aquí puedes listar los beneficios adicionales.",
  },
  {
    pregunta: "Cuántos perfiles o dispositivos puedo usar por plataforma",
    respuesta: "Describe los límites según cada plataforma.",
  },
];


export const SectionNine = () =>{
    const [activeIndex, setActiveIndex] = useState (null);

    const toggleIndex = (index) => {
        setActiveIndex(prev => (prev === index ? null : index));
        };

    return(
        <section className="section-nine">
            <h2 className="faq-title">Preguntas Frecuentes</h2>

            <div className="faq-container">
                {questions.map((item, i) => (
                <div key={i} className="faq-item">
                    <div className="faq-question" onClick={() => toggleIndex(i)}>
                    <span>{item.pregunta}</span>
                    <span className="faq-toggle">{activeIndex === i ? "−" : "+"}</span>
                    </div>
                    {activeIndex === i && (
                    <div className="faq-answer">
                        <p>{item.respuesta}</p>
                    </div>
                    )}
                </div>
                ))}
            </div>
            <div className="faq-btn-container">
                <img src={btn} alt="quiero mi membresia" className="faq-btn" />
            </div>
        </section>
    )
}