#!/bin/bash

# Script para levantar Backend y Frontend simultáneamente
# Autor: Gemini CLI

echo "--- Iniciando Entorno de Desarrollo (UnrafTickets) ---"

# Función para cerrar ambos procesos al terminar el script
trap "kill 0" EXIT

# 1. Iniciar el Backend en segundo plano
echo ""
echo ">>> Iniciando BACKEND (Django) en puerto 8000..."
cd backend || exit
./venv/Scripts/python.exe manage.py runserver &

# 2. Iniciar el Frontend en segundo plano
echo ""
echo ">>> Iniciando FRONTEND (Vite) en puerto 5173..."
cd ../frontend || exit
powershell.exe -ExecutionPolicy Bypass -Command "npm run dev" &

echo ""
echo "Ambos servidores están arrancando. Presiona Ctrl+C para detenerlos."

# Esperar a que los procesos terminen
wait
