#!/bin/bash

# Script para ejecutar todos los tests del proyecto (Frontend y Backend)
# Autor: Gemini CLI

echo "--- Iniciando Pruebas del Sistema de Tickets ---"

# 1. Pruebas del Backend (Django)
echo ""
echo ">>> Ejecutando pruebas del BACKEND (Django)..."
cd ../backend || exit
# Asegurarse de que el entorno virtual esté activo o usar la ruta directa
PYTHON_EXE="./venv/Scripts/python.exe"

if [ ! -f "$PYTHON_EXE" ]; then
    echo "Error: No se encontró el entorno virtual en backend/venv."
    exit 1
fi

echo "Instalando/Actualizando dependencias del backend..."
"$PYTHON_EXE" -m pip install -r requirements.txt --quiet

echo "Corriendo tests con cobertura..."
"$PYTHON_EXE" -m coverage run manage.py test api
"$PYTHON_EXE" -m coverage report

# 2. Pruebas del Frontend (Vitest)
echo ""
echo ">>> Ejecutando pruebas del FRONTEND (React/Vite)..."
cd ../frontend || exit

echo "Instalando dependencias del frontend..."
# Usando powershell para evitar problemas de permisos en Windows si es necesario
powershell.exe -ExecutionPolicy Bypass -Command "npm install --silent"

echo "Corriendo tests con cobertura..."
powershell.exe -ExecutionPolicy Bypass -Command "npm run test:coverage"

echo ""
echo "--- Pruebas Finalizadas ---"
