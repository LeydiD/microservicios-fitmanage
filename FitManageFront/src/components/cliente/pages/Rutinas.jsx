import React, { useState, useContext, useRef, useEffect } from "react";
import "./Rutinas.css";
import {
  generarRutina,
  obtenerRutinasPorCliente,
} from "../../../api/RutinaApi.js";
import { AuthContext } from "../../../context/AuthContext.jsx";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { IoSend, IoDocument, IoFitness } from "react-icons/io5";

const Rutinas = () => {
  const { user } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 ¡Hola! Soy tu asistente personal de entrenamiento. ¿Qué músculos deseas trabajar hoy y cuánto tiempo tienes disponible?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // 🔹 Cargar historial previo del cliente
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const historial = await obtenerRutinasPorCliente(user.DNI);

        if (historial && historial.rutinas && historial.rutinas.length > 0) {
          const mensajesFormateados = historial.rutinas.map((m) => ({
            from: m.es_prompt ? "user" : "bot",
            text: m.mensaje,
            timestamp: new Date(m.fecha_generacion).toLocaleTimeString(),
          }));

          setMessages([
            {
              from: "bot",
              text: `💬 Bienvenido nuevamente, ${historial.cliente}. Aquí tienes tu historial reciente:`,
            },
            ...mensajesFormateados,
          ]);
        }
      } catch (err) {
        console.error("No se pudo cargar el historial:", err.message);
      }
    };

    cargarHistorial();
  }, [user.DNI]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatBoxRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
      }
    };

    chatBoxRef.current?.addEventListener("scroll", handleScroll);
    return () =>
      chatBoxRef.current?.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (sending || loading || !input.trim()) return;

    setSending(true);
    setLoading(true);

    const userMessage = {
      from: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    inputRef.current?.focus();

    try {
      console.log("📤 Enviando mensaje a la IA...");

      const respuesta = await generarRutina({
        message: input,
        altura: user.altura,
        peso: user.peso,
        objetivo: user.objetivo,
        nombre: user.nombre,
        id_cliente: user.DNI,
      });

      console.log("✅ Respuesta completa del backend:", respuesta);

      // 🔹 Extraer el mensaje correctamente
      let mensajeBot = "";

      if (typeof respuesta === "string") {
        mensajeBot = respuesta;
      } else if (respuesta.mensaje) {
        mensajeBot = respuesta.mensaje;
      } else if (respuesta.response) {
        mensajeBot =
          typeof respuesta.response === "string"
            ? respuesta.response
            : respuesta.response.mensaje || JSON.stringify(respuesta.response);
      } else {
        mensajeBot = "Rutina generada correctamente.";
      }

      console.log(
        "📝 Mensaje del bot extraído (primeros 100 chars):",
        mensajeBot.substring(0, 100)
      );

      if (!mensajeBot || mensajeBot.trim() === "") {
        throw new Error("Respuesta vacía del servidor");
      }

      const botMessage = {
        from: "bot",
        text: mensajeBot,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error("❌ Error en el flujo del chat:", error);

      let errorMessage = "❌ Lo siento, ocurrió un error al generar la rutina.";

      if (
        error.message.includes("timeout") ||
        error.message.includes("tardó demasiado")
      ) {
        errorMessage =
          "⏱️ La IA está tardando más de lo esperado. Por favor, intenta con un mensaje más específico o corto.";
      } else if (error.message.includes("Network Error")) {
        errorMessage =
          "🌐 Error de conexión. Verifica tu internet e intenta nuevamente.";
      }

      setMessages([
        ...newMessages,
        {
          from: "bot",
          text: errorMessage,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setSending(false);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 🔹 Función existente de PDF (no cambia)
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    const addPageIfNeeded = (currentY, neededSpace = 20) => {
      if (currentY > 270) {
        doc.addPage();
        return margin + neededSpace;
      }
      return currentY;
    };

    const drawHeader = () => {
      doc.setFillColor(213, 0, 0);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("Rutina Personalizada", pageWidth / 2, 25, { align: "center" });
    };

    const drawUserInfo = (y) => {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y - 10, contentWidth, 50, "F");

      doc.setTextColor(51, 51, 51);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Información del Usuario", margin + 5, y + 5);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const infoUsuario = [
        `Nombre: ${user.nombre}`,
        `Objetivo: ${user.objetivo}`,
        `Altura: ${user.altura} cm  |  Peso: ${user.peso} kg`,
      ];

      infoUsuario.forEach((texto, index) => {
        doc.text(texto, margin + 5, y + 20 + index * 10);
      });

      return y + 60;
    };

    const formatearTextoRutina = (texto) => {
      return texto
        .replace(/[*_`>#]+/g, "")
        .replace(/-\s/g, "• ")
        .split("\n")
        .filter((line) => line.trim() !== "");
    };

    const drawRutina = (y) => {
      let currentY = y;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(213, 0, 0);
      doc.text("Tu Rutina de Ejercicios", margin, currentY);
      currentY += 10;

      doc.setDrawColor(213, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);

      messages.forEach((msg, i) => {
        if (msg.from === "bot" && i > 0) {
          const lineasRutina = formatearTextoRutina(msg.text);
          lineasRutina.forEach((linea) => {
            const lineasDivididas = doc.splitTextToSize(linea, contentWidth);
            lineasDivididas.forEach((lineaDividida) => {
              currentY = addPageIfNeeded(currentY);
              if (lineaDividida.trim().endsWith(":")) {
                doc.setFont("helvetica", "bold");
                currentY += 5;
              } else {
                doc.setFont("helvetica", "normal");
              }
              doc.text(lineaDividida, margin, currentY);
              currentY += 7;
            });
          });
          currentY += 5;
        }
      });
      return currentY;
    };

    const drawFooter = () => {
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(213, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, 280, pageWidth - margin, 280);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${totalPages} | FitManage - Tu asistente personal`,
          pageWidth / 2,
          285,
          { align: "center" }
        );
      }
    };

    drawHeader();
    let currentY = drawUserInfo(50);
    currentY = drawRutina(currentY);
    drawFooter();

    const nombreArchivo = `rutina_${user.nombre
      .toLowerCase()
      .replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    doc.save(nombreArchivo);
  };

  const hayRutinaGenerada = messages.some(
    (msg, index) => msg.from === "bot" && index > 0
  );

  return (
    <div className="chat-container">
      <div className="chat-header">
        <IoFitness size={24} />
        <h2>Asistente de Entrenamiento</h2>
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
            <span className="message-timestamp">{msg.timestamp}</span>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        {showScrollButton && (
          <button className="scroll-bottom-button" onClick={scrollToBottom}>
            ↓
          </button>
        )}
      </div>

      <div className="input-area">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe tu objetivo o pregunta sobre ejercicios..."
          disabled={loading}
        />
        <button type="button" onClick={handleSend} disabled={loading}>
          {loading ? (
            "Generando..."
          ) : (
            <>
              Enviar <IoSend />
            </>
          )}
        </button>
        {hayRutinaGenerada && (
          <button onClick={handleDownloadPDF} className="pdf-button">
            <IoDocument /> PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default Rutinas;
