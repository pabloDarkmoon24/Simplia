import React, {useState} from "react";
import '../SectionNine/sectionNine.css'
import btn from '../../assets/Boton-quiero-mi-membresia.png'


const questions = [
  {
    pregunta: "¿Qué plataformas incluye?",
    respuesta: "manejamos tres planes actualmente. Cada plan cuenta con un grupo selecto de suscripciones premium originales, que puedes revisar en la sección de membresías.",
  },
  {
    pregunta: "¿Cómo recibo mis accesos?",
    respuesta: "Actualmente, todos tus accesos y consultas los puedes gestionar a través de nuestro WhatsApp, donde tenemos asesores disponibles para atenderte.",
  },
  {
    pregunta: "¿Puedo cancelar cuando quiera?",
    respuesta: "No manejamos cláusulas de permanencia en ninguno de nuestros planes. Tú decides si deseas renovar la suscripción o dejarla vencer.",
  },
  {
    pregunta: "¿Qué pasa si tengo dudas?",
    respuesta: "Puedes comunicarte con nosotros siempre que lo necesites a través de nuestro WhatsApp.",
  },
  {
    pregunta: "¿Cuáles son los regalos o descuentos?",
    respuesta: "Cada mes estaremos ofreciendo descuentos en diferentes empresas o franquicias para que disfrutes aún más de tu membresía, sin olvidar que contarás con tus plataformas preferidas.",
  },
  {
    pregunta: "¿Cuántos perfiles o dispositivos puedo usar por plataforma?",
    respuesta: "Cada suscripción cuenta con una pantalla de un producto digital disponible para un dispositivo. Te recomendamos revisar las guías para comprender el funcionamiento específico de cada producto.",
  }
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
                <img src={btn} alt="quiero mi membresia" className="faq-btn"
                    onClick={() => {
                    const target = document.getElementById("membresias");
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                    }} />
            </div>
        </section>
    )
}