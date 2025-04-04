"use client"

import { useState, useRef } from "react"
import { Clock, Calendar, User, CheckCircle, Wifi, WifiOff, ArrowRightCircle, XCircle, Trash } from "lucide-react"

const API_URL = "http://20.197.229.78:5202/api/clients/enter-the-gym"
const IMAGES_BASE_URL = import.meta.env.VITE_IMAGES_BASE_URL;

const AccessControlPage = () => {
  const [ipAddress, setIpAddress] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [message, setMessage] = useState("Ingresa la dirección IP del teclado para conectar")
  const ws = useRef(null)
  const [connected, setConnected] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)

  const connectToKeyboard = () => {
    if (!ipAddress) {
      setMessage("Por favor ingresa una dirección IP")
      return
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close()
    }

    setMessage("Conectando el teclado...")
    setLoading(true)

    try {
      ws.current = new WebSocket(`ws://${ipAddress}:81`)

      ws.current.onopen = () => {
        console.log("Teclado conectado")
        setConnected(true)
        setMessage("Ingrese su cédula de identidad.")
        setLoading(false)
      }

      ws.current.onclose = () => {
        console.log("Desconectado del teclado")
        setConnected(false)
        setMessage("Conexión perdida. Por favor, vuelve a conectar.")
        setLoading(false)
      }

      ws.current.onerror = (error) => {
        console.error("Error de WebSocket:", error)
        setConnected(false)
        setMessage("Fallo en la conexión. Verifica la dirección IP e inténtalo de nuevo.")
        setLoading(false)
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.key) {
            handleKeypadInput(data.key)
          }
        } catch (e) {
          console.error("Error al analizar el mensaje:", e)
        }
      }
    } catch (error) {
      console.error("Error de conexión WebSocket:", error)
      setMessage("Error al conectar. Verifica el formato de la dirección IP.")
      setLoading(false)
    }
  }

  const handleKeypadInput = (key) => {
    if (!key) return

    switch (key) {
      case "A":
        setInputValue((prev) => {
          if (prev.length > 0) {
            verifyAccess(prev)
          }
          return prev // No cambia el estado, solo ejecuta verifyAccess()
        })
        break
      case "B":
        setInputValue((prev) => prev.slice(0, -1))
        break
      case "C":
        setInputValue("")
        break
      default:
        if (inputValue.length < 10) {
          setInputValue((prev) => prev + key)
        }
        break
    }
  }

  const verifyAccess = async (ci) => {
    setMessage("Verificando ID...")
    setLoading(true)
    setUserData(null)

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ci: ci }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`¡Bienvenido ${data.name}!`)
        setUserData(data)
        setInputValue("")
        setLoading(false)

        // Mantener los datos visibles por un tiempo más largo
        setTimeout(() => {
          if (!inputValue) {
            setMessage("Listo para escanear ID")
            setUserData(null)
          }
        }, 15000)
      } else {
        setMessage("Acceso denegado. ID inválido.")
        setLoading(false)

        setTimeout(() => {
          setInputValue("")
          setMessage("Listo para escanear ID")
        }, 3000)
      }
    } catch (error) {
      console.error("Error en la API:", error)
      setMessage("Error del servidor. Por favor, intenta de nuevo.")
      setLoading(false)

      setTimeout(() => {
        setInputValue("")
        setMessage("Listo para escanear ID")
      }, 3000)
    }
  }

  const disconnect = () => {
    if (ws.current) {
      ws.current.close()
    }
    setConnected(false)
    setMessage("Desconectado. Ingresa la dirección IP para reconectar.")
    setInputValue("")
    setUserData(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-yellow-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">GYM ONIX</h1>
          <div className="flex items-center space-x-2">
            {connected ? (
              <div className="flex items-center text-cyan-300">
                <Wifi className="h-5 w-5 mr-1" />
                <span className="text-sm">Conectado: {ipAddress}</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-400">
                <WifiOff className="h-5 w-5 mr-1" />
                <span className="text-sm">Desconectado</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Status Message */}
        <div className="bg-gray-900 border border-cyan-300 shadow-md rounded-lg p-6 mb-6">
          <p className="text-center text-xl font-medium text-cyan-300 flex items-center justify-center">
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {message}
              </span>
            ) : (
              message
            )}
          </p>
        </div>

        {/* Connection Panel */}
        {!connected ? (
          <div className="bg-gray-900 border border-yellow-400 shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Conexión del Teclado</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-cyan-300 mb-2">IP del teclado:</label>
              <div className="flex">
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ej. 192.168.1.100"
                />
                <button
                  onClick={connectToKeyboard}
                  className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-r-md hover:bg-yellow-300 transition-colors"
                >
                  Conectar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="bg-gray-900 border border-yellow-400 shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-yellow-400">Control de Acceso</h2>
                <button
                  onClick={disconnect}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Desconectar
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-cyan-300 mb-2">Cédula de identidad:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    readOnly
                    className="w-full px-4 py-3 text-lg border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    placeholder="Esperando entrada del teclado..."
                  />
                  {inputValue && (
                    <button
                      onClick={() => setInputValue("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => inputValue && verifyAccess(inputValue)}
                  disabled={!inputValue || loading}
                  className={`px-6 py-2 rounded-md flex items-center ${
                    !inputValue || loading
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-500 text-white hover:bg-cyan-400"
                  } transition-colors`}
                >
                  <ArrowRightCircle className="h-5 w-5 mr-2" />
                  Verificar Acceso
                </button>
              </div>
            </div>

            {/* User Data Panel */}
            <div className="bg-gray-900 border border-cyan-300 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold text-cyan-300 mb-4">Información del Miembro</h2>

              {userData ? (
                <div className="space-y-4">
                  {userData.userPhotoUrl ? (
                    <div className="flex justify-center mb-4">
                      <div className="w-50 h-50 rounded-full overflow-hidden border-2 border-yellow-400">
                        <img
                          src={IMAGES_BASE_URL + "/uploads/" +userData.userPhotoUrl || "/placeholder.svg"}
                          alt={`Foto de ${userData.name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/150?text=Sin+Foto"
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-2 border-yellow-400">
                        <User className="h-12 w-12 text-gray-500" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Nombre</p>
                      <p className="font-bold text-white">{userData.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Plan de Membresía</p>
                      <p className="font-bold text-white">{userData.actualMemebershipPlan}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-6 w-6 text-cyan-300" />
                      <div>
                        <p className="text-sm text-gray-400">Inicio</p>
                        <p className="font-bold text-white">{formatDate(userData.initDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-6 w-6 text-cyan-300" />
                      <div>
                        <p className="text-sm text-gray-400">Vencimiento</p>
                        <p className="font-bold text-white">{formatDate(userData.finishDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Días en el Gym</p>
                      <p className="font-bold text-white">{userData.daysInGym}</p>
                    </div>
                  </div>

                  {userData.checkins && userData.checkins.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Últimos Check-ins:</p>
                      <div className="max-h-32 overflow-y-auto bg-gray-800 rounded-md p-2">
                        {userData.checkins.map((checkin, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 py-1 border-b border-gray-700 last:border-0"
                          >
                            <Clock className="h-4 w-4 text-cyan-300" />
                            <p className="text-sm text-white">
                              {formatDate(checkin.checkInDate)} - {formatTime(checkin.checkInDate)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <User className="h-12 w-12 mb-2" />
                  <p>No hay información disponible</p>
                  <p className="text-sm">Escanea una cédula para ver los detalles</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-yellow-400 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Gym Onix - Control de Acceso</p>
        </div>
      </footer>
    </div>
  )
}

export default AccessControlPage

